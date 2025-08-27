// routes/transactions.js
const express = require('express');
const axios = require('axios');
const { generateSignature } = require('../utils/auth');

const router = express.Router();
const BASE = (process.env.YAYA_BASE_URL || 'https://sandbox.yayawallet.com').replace(/\/+$/, '');
const API_KEY = process.env.YAYA_API_KEY;
const API_SECRET = process.env.YAYA_API_SECRET;

async function callYaya({ method, path, body }) {
  const endpointPath = path.startsWith('/') ? path : `/${path}`;
  const endpointNoQuery = endpointPath.split('?')[0];
  // const bodyString = (body === undefined || body === null) ? "" : JSON.stringify(body);

  // replace with:
let bodyString;
if (body === undefined || body === null) {
  bodyString = "";
} else if (typeof body === 'string' && body === "") {
  // defensive: an explicit empty string should be treated as no body
  bodyString = "";
} else {
  bodyString = JSON.stringify(body);
}

  // helper to generate signed headers for a given timestamp string and endpoint-to-sign
  const mkSignedHeaders = (timestampStr, endpointToSign) => {
    // build canonical exactly as docs: {timestamp}{METHOD}{endpoint}{body}
    const canonical = `${timestampStr}${method.toUpperCase()}${endpointToSign}${bodyString || ""}`;

    // compute signature using the same logic as your utils/auth
    const crypto = require('crypto');
    const signature = crypto.createHmac('sha256', API_SECRET).update(canonical).digest('base64');

    const headers = {
      'Content-Type': 'application/json',
      'YAYA-API-KEY': API_KEY,
      'YAYA-API-TIMESTAMP': timestampStr,
      'YAYA-API-SIGN': signature,
    };
    return { headers, canonical, signature };
  };

  // variants to try (ordered)
  const ms = Date.now().toString();
  const µs = ms + '000';
  const variants = [
    { name: 'ms+withQuery', timestamp: ms, endpoint: endpointPath },
    { name: 'us+withQuery', timestamp: µs, endpoint: endpointPath },
    { name: 'ms+noQuery', timestamp: ms, endpoint: endpointNoQuery },
    { name: 'us+noQuery', timestamp: µs, endpoint: endpointNoQuery },
  ];

  const url = `${BASE}${endpointPath}`;

  // Try each variant sequentially until we get a non-401 response (or exhaust options)
  let lastError = null;
  for (const v of variants) {
    const { headers, canonical, signature } = mkSignedHeaders(v.timestamp, v.endpoint);

    // TEMP DEBUG: log what we're trying (do not output secret)
    console.log('TRY VARIANT:', v.name);
    console.log({ url, signedEndpoint: v.endpoint, timestamp: v.timestamp, canonical, signature });

    const axiosConfig = {
      method,
      url,
      headers,
      data: method.toUpperCase() === 'GET' ? undefined : bodyString,
      timeout: 15000,
      validateStatus: () => true // accept all status codes so we can inspect them
    };

    try {
      const resp = await axios(axiosConfig);

      // If YaYa returns 401 or signature error, try next variant
      if (resp.status === 401 || (resp.data && resp.data.error && /signature/i.test(String(resp.data.error)))) {
        console.warn(`Variant ${v.name} got status ${resp.status} and body`, resp.data);
        lastError = { status: resp.status, data: resp.data };
        continue; // try next
      }

      // success (or any non-401) — return this
      console.log(`Variant ${v.name} accepted (status ${resp.status})`);
      return { status: resp.status, data: resp.data };

    } catch (err) {
      // network-level error — record and continue trying other variants
      console.error(`Network error for variant ${v.name}:`, err.message, err.code);
      lastError = { error: err.message, code: err.code };
      continue;
    }
  }

  // if we get here nothing accepted — return last error (or generic)
  if (lastError) {
    // if lastError came from YaYa response, forward it with that status
    if (lastError.status) return { status: lastError.status, data: lastError.data };
    // otherwise throw
    throw new Error('All signature variants failed: ' + JSON.stringify(lastError));
  }

  throw new Error('All signature variants failed with unknown error.');
}

/**
 * GET /api/transactions?p=1
 * forwards to GET /api/en/transaction/find-by-user?p=1
 */
router.get('/', async (req, res, next) => {
  try {
    const page = req.query.p || 1;
    const path = `/api/en/transaction/find-by-user?p=${encodeURIComponent(page)}`;
    // const result = await callYaya({ method: 'GET', path, body: '' });
    // preferred: omit body for GET
const result = await callYaya({ method: 'GET', path });

    // Forward status code and body from YaYa
    res.status(result.status).json(result.data);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/transactions/search
 * body: { query: string, page?: number }
 * forwards to POST /api/en/transaction/search?p=X with { query }
 */
router.post('/search', async (req, res, next) => {
  try {
    const { query } = req.body;
    const page = req.query.p || req.body.page || 1;
    const path = `/api/en/transaction/search?p=${encodeURIComponent(page)}`;
    const result = await callYaya({ method: 'POST', path, body: { query } });
    res.status(result.status).json(result.data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
