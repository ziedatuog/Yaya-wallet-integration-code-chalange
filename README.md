Yaya Wallet Dashboard

A full-stack app to view and search user transactions via the YaYa Wallet API.

Frontend: yaya-wallet-dashboard (React + RTK Query + MUI)

Backend: yaya-wallet-backend (Express proxy with YaYa API integration)

 Setup
Backend (yaya-wallet-backend)
cd yaya-wallet-backend
npm install


Create .env:

PORT=4000
ALLOWED_ORIGINS=http://localhost:3000
YAYA_BASE_URL=https://sandbox.yayawallet.com
YAYA_API_KEY=your_api_key
YAYA_API_SECRET=your_secret


Run:

npm run dev

Frontend (yaya-wallet-dashboard)
cd yaya-wallet-dashboard
npm install


Create .env:

REACT_APP_PROXY_BASE=http://localhost:4000


Run:

npm start

 API Routes

GET /api/transactions?p=1 → list transactions

POST /api/transactions/search?p=1 → search transactions { query }

 Tech Stack

Backend: Express, Axios, Helmet, CORS, Dotenv

Frontend: React, Redux Toolkit Query, Material-UI, Day.js

 Apps run at:

Backend → http://localhost:4000

Frontend → http://localhost:3000