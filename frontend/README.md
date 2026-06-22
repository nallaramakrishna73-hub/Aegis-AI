# Aegis-AI Frontend

Professional dark green themed cybersecurity dashboard for Aegis-AI.

## Features

- **Dashboard** - Real-time threat visualization with overview cards
- **Threat Intelligence** - Detailed view of detected threats
- **Risk Assessment** - Risk distribution charts and severity scoring
- **Security Assistant** - AI-powered chat for security questions
- **Dark Green Theme** - Professional, modern UI with Tailwind CSS
- **Real-time Updates** - Socket.io integration for live threat alerts
- **Responsive Design** - Works on desktop and mobile devices

## Getting Started

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```
   Frontend will be available at `http://localhost:5173`

3. Build for production:
   ```bash
   npm run build
   npm run preview
   ```

## API Integration

The frontend connects to the backend at `http://localhost:4000`:
- Dashboard fetches `/api/summary` and `/api/threats`
- Chat sends questions to `/api/chat`
- Real-time threats come via Socket.io events

Make sure the backend is running before starting the frontend!

## Project Structure

```
src/
  components/     - Reusable UI components
  pages/          - Full page views
  services/       - API and Socket.io clients
  types/          - TypeScript interfaces
  App.tsx         - Main app component
  index.css       - Tailwind + custom styles
  main.tsx        - Entry point
```

## Theme Colors

- **Primary Green**: #22c55e (dark-500) to #052e16 (dark-950)
- **Background**: #0f172a (slate-950) to #020617 (slate-950)
- **Cards**: #1e293b (slate-800) with green accent borders
- **Text**: Slate-100 for readability on dark backgrounds

## Dependencies

- React 18 + TypeScript
- Tailwind CSS for styling
- Socket.io for real-time updates
- Lucide React for icons
- Axios for API calls
