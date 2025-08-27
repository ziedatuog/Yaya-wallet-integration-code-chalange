// utils/auth.js
const crypto = require('crypto');

/**
 * Generate YAYA API signature
 * @param {Object} params
 * @param {string} params.method - HTTP method (GET/POST)
 * @param {string} params.endpoint - path portion e.g. /api/en/transaction/find-by-user?p=1
 * @param {string} params.body - stringified body or empty string
 * @param {string} params.secret - API secret
 * @param {Object} options
 * @param {boolean} options.useMicroseconds - if true, uses milliseconds*1000 (diagnostic)
 * @returns {{timestamp: string, signature: string, canonical: string}}
 */
function generateSignature({ method, endpoint, body = "", secret }, options = {}) {
  if (!secret) throw new Error('Missing API secret');
  const ms = Date.now();
  // Diagnostic option: sometimes docs show microseconds; allow trying both
  const timestamp = options.useMicroseconds ? (ms.toString() + '000') : ms.toString();

  const canonical = `${timestamp}${method.toUpperCase()}${endpoint}${body || ""}`;

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(canonical);
  const signature = hmac.digest('base64');

  return { timestamp, signature, canonical };
}

module.exports = { generateSignature };
