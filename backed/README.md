# Aegis-AI Backend

Backend for Aegis-AI, an AI-powered cybersecurity assistant.

## Features

- Log ingestion and standardization
- Threat detection engine
- AI-style analysis and alert translation
- Risk assessment and recommendation generation
- Incident report export (PDF/DOCX)
- Socket.io real-time monitoring

## Getting Started

1. Install dependencies:
   ```bash
   cd backed
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

- `GET /api/status` - health check
- `POST /api/logs` - ingest raw log entries
- `GET /api/threats` - fetch processed threats
- `GET /api/summary` - aggregated dashboard summary
- `POST /api/report` - generate incident report
- `POST /api/chat` - ask security questions

## Notes

This backend is intentionally scaffolded for local development and demonstration.
AI functionality is simulated with rule-based analysis and explanation generation.
