# BizTrack

BizTrack is a complete business management platform featuring:
- **Web Dashboard**: React + Vite + Tailwind CSS + Lucide Icons
- **Mobile App**: React Native + Expo + Expo Router
- **Backend API**: Node.js + Express + TypeScript + PostgreSQL (Neon Cloud)

---

## Project Structure

```
BizTrack/
├── biz-track-backend/     # Express REST API (Port 5000)
├── biz-track-web/         # Vite React web application (Port 5173)
├── biz-track-mobile/      # React Native / Expo mobile application
├── Logos/                 # Brand assets & icons
└── README.md
```

---

## Getting Started

### 1. Backend (`biz-track-backend`)
```bash
cd biz-track-backend
npm install
npm run build
npm run start
```
Runs at `http://localhost:5000` (API base: `http://localhost:5000/api`).

### 2. Web App (`biz-track-web`)
```bash
cd biz-track-web
npm install
npm run dev
```
Runs at `http://localhost:5173`.

### 3. Mobile App (`biz-track-mobile`)
```bash
cd biz-track-mobile
npm install
npx expo start
```
Scan the QR code with Expo Go on your mobile device (on the same Wi-Fi network) or run in an emulator.

---

## Database Configuration
Powered by serverless **Neon Cloud PostgreSQL** with resilient auto-retrying pooled connections.
All orders, transactions, and settings persist directly to Neon Cloud DB with zero sample dummy data.
