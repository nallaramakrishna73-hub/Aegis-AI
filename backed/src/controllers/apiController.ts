import express from 'express';
import { LogService } from '../services/logService.js';
import { ThreatDetectionService } from '../services/threatDetectionService.js';
import { AnalysisService } from '../services/analysisService.js';
import { RiskService } from '../services/riskService.js';

const router = express.Router();
const logService = new LogService();
const detectionService = new ThreatDetectionService();
const analysisService = new AnalysisService();
const riskService = new RiskService();

router.get('/status', (req, res) => {
  res.json({ status: 'ok', name: 'Aegis-AI Backend' });
});

router.post('/logs', (req, res) => {
  const { raw, source } = req.body;
  if (!raw || !source) {
    return res.status(400).json({ error: 'raw and source are required' });
  }
  const event = logService.ingestLog(raw, source);
  let threat = detectionService.analyzeEvent(event);
  if (threat) {
    threat = riskService.calculateRisk(threat);
  }
  const io = req.app.locals.io;
  if (io && threat) {
    io.emit('newThreat', threat);
  }
  return res.json({ event, threat, classification: analysisService.classifyFromLog(raw) });
});

router.get('/threats', (req, res) => {
  const threats = detectionService.getThreats().map((threat) => riskService.calculateRisk(threat));
  res.json({ threats });
});

router.get('/summary', (req, res) => {
  const threats = detectionService.getThreats().map((threat) => riskService.calculateRisk(threat));
  const summary = riskService.buildSummary(threats);
  res.json({ summary });
});

router.post('/chat', (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'question is required' });
  }
  const answer = generateAnswer(question.toString());
  res.json({ question, answer });
});

router.post('/detect-all', (req, res) => {
  const threats = detectionService.detectAll();
  const summary = riskService.buildSummary(threats);
  res.json({ threats, summary });
});

router.get('/events', (req, res) => {
  res.json({ events: logService.getEvents() });
});

function generateAnswer(question: string) {
  const lower = question.toLowerCase();
  if (lower.includes('why') && lower.includes('dangerous')) {
    return 'This attack attempts to gain unauthorized access by guessing passwords.';
  }
  if (lower.includes('risk')) {
    return 'The current threats are scored based on severity, frequency, and source reputation.';
  }
  if (lower.includes('recommend')) {
    return 'Review the recommendations attached to each threat and apply the highest-risk protections first.';
  }
  return 'Aegis-AI recommends reviewing the alert details and checking source reputation.';
}

export default router;
