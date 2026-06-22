# Aegis-AI Complete Setup Guide

## Project Overview

Aegis-AI is a professional AI-powered cybersecurity assistant built with a modern tech stack:

### Backend (Node.js + TypeScript)
- Express.js REST API
- Socket.io for real-time threat alerts
- Threat detection engine with rule-based analysis
- Risk assessment and report generation (PDF/DOCX)
- Port: 4000

### Frontend (React + TypeScript)
- Vite for fast builds
- Tailwind CSS with dark green professional theme
- Real-time dashboard with live threat updates
- Security assistant chat interface
- Responsive design for desktop/mobile
- Port: 5173

## Quick Start

### Backend Setup
```bash
cd backed
npm install
npm run dev           # Start development server
npm run build        # Build for production
npm start            # Run production build
```

Backend API available at: `http://localhost:4000`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

Frontend available at: `http://localhost:5173`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/status` | Health check |
| POST | `/api/logs` | Ingest raw logs |
| GET | `/api/threats` | Get all threats |
| GET | `/api/summary` | Dashboard summary |
| POST | `/api/chat` | Ask security questions |
| POST | `/api/detect-all` | Analyze all logs |
| POST | `/api/reports` | Generate report (PDF/DOCX) |
| GET | `/api/events` | Get raw events |

## Features Implemented

✅ **Log Collection & Storage**
- Standardized security event ingestion
- In-memory/file-based persistence

✅ **Threat Detection**
- Brute force attack detection
- Port scanning identification
- Malware activity detection
- Unauthorized access flagging
- Network anomaly detection

✅ **AI Analysis Engine**
- Log classification
- Attack type identification
- Severity determination
- Plain language explanations

✅ **Risk Assessment**
- Multi-factor risk scoring
- 4-level risk classification (Low/Medium/High/Critical)
- Risk distribution analytics

✅ **Recommendations**
- Contextual security recommendations
- Attack-specific mitigation steps

✅ **Dashboard**
- Real-time threat overview
- Risk distribution charts
- Top attack sources tracking
- Active incident counter

✅ **Security Copilot Chat**
- Question-based interface
- Context-aware responses
- Live updates via Socket.io

✅ **Report Generation**
- PDF incident reports
- DOCX incident reports
- Customizable threat summaries

✅ **Real-time Monitoring**
- WebSocket event streaming
- Live dashboard updates
- Instant threat notifications

## Theme & Design

**Color Palette:**
- Primary Green: `#22c55e` → `#052e16` (dark-500 → dark-950)
- Dark Background: `#0f172a` (slate-950)
- Card Background: `#1e293b` (slate-800)
- Text: `#f1f5f9` (slate-100)
- Accent: Glowing green shadows

**Professional UI Elements:**
- Gradient backgrounds (dark blue to dark green)
- Green glow effects on hover
- Risk color coding (Red/Orange/Yellow/Green)
- Status indicators with icons
- Smooth animations & transitions

## Project Structure

```
aegis-ai/
├── backed/                 # Backend API
│   ├── src/
│   │   ├── services/      # Business logic
│   │   ├── controllers/   # API routes
│   │   ├── models/        # TypeScript types
│   │   ├── utils/         # Storage & helpers
│   │   └── index.ts       # Express app
│   ├── dist/              # Compiled JS
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── frontend/              # React Dashboard
│   ├── src/
│   │   ├── components/    # Reusable UI
│   │   ├── pages/         # Page components
│   │   ├── services/      # API & Socket clients
│   │   ├── types/         # TypeScript interfaces
│   │   ├── App.tsx        # Main app
│   │   ├── main.tsx       # Entry point
│   │   └── index.css      # Tailwind styles
│   ├── dist/              # Built files
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── package.json
│   └── README.md
│
└── logs/                  # Log storage
```

## Running Both Services

**Terminal 1 - Backend:**
```bash
cd /home/kali/aegis-ai/backed
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd /home/kali/aegis-ai/frontend
npm run dev
```

Then open: `http://localhost:5173`

## Testing the System

1. **Add a test log:**
   ```bash
   curl -X POST http://localhost:4000/api/logs \
     -H "Content-Type: application/json" \
     -d '{"raw":"Failed SSH login from 192.168.1.100","source":"ssh"}'
   ```

2. **Get threats:**
   ```bash
   curl http://localhost:4000/api/threats
   ```

3. **Get dashboard summary:**
   ```bash
   curl http://localhost:4000/api/summary
   ```

## Next Steps for Production

- [ ] Add database (MongoDB/PostgreSQL)
- [ ] Implement real threat intelligence feeds
- [ ] Add user authentication & roles
- [ ] Deploy with Docker
- [ ] Add ML-based threat detection
- [ ] Implement WebAuthn for security
- [ ] Add mobile app
- [ ] Integrate with SIEM systems
- [ ] Set up CI/CD pipeline
