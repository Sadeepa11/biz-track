# BizDesk Backend API

Express & TypeScript REST API service for the BizDesk Field Operations Platform (Web & Mobile).

## Tech Stack
- **Node.js** & **Express**
- **TypeScript**
- **tsx** (Hot-reloading development execution)
- **Helmet** (HTTP security headers)
- **CORS** (Configured for web and mobile clients)
- **Morgan** (HTTP request logger)

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default port is `5000`.

### 3. Run in Development Mode
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
npm start
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API status and endpoint directory |
| `GET` | `/api/health` | Service health & uptime |
| `GET` | `/api/overview` | Full overview dashboard bundle (metrics, orders, revenue) |
| `GET` | `/api/overview/metrics` | Dashboard top metric cards |
| `GET` | `/api/overview/orders` | Recent dispatch queue & geo coordinates |
| `GET` | `/api/overview/revenue` | Monthly revenue trend |

---

## Project Structure
```
biz-desk-backend/
├── src/
│   ├── config/          # Environment variable loaders
│   ├── controllers/     # Express route handlers
│   ├── middleware/      # Error & 404 handlers
│   ├── routes/          # Express Routers
│   ├── services/        # Business logic & data handlers
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── .env.example
├── package.json
└── tsconfig.json
```
