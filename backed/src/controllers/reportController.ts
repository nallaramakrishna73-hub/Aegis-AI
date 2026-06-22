import express from 'express';
import path from 'path';
import { ReportService } from '../services/reportService.js';
import { loadJson } from '../utils/storage.js';
import { ThreatRecord } from '../models/threat.js';

const router = express.Router();
const service = new ReportService();

router.post('/', async (req, res) => {
  const { format = 'pdf' } = req.body;
  const threats = loadJson<ThreatRecord[]>('threats.json', []);
  const fileName = `aegis-report-${Date.now()}.${format}`;
  const filePath = path.resolve(process.cwd(), 'data', fileName);

  try {
    if (format === 'docx') {
      await service.generateDocx(threats, filePath);
    } else {
      await service.generatePdf(threats, filePath);
    }
    res.json({ file: `/api/reports/download/${fileName}` });
  } catch (error) {
    res.status(500).json({ error: 'Could not generate report.' });
  }
});

router.get('/download/:fileName', (req, res) => {
  const filePath = path.resolve(process.cwd(), 'backed', 'data', req.params.fileName);
  res.sendFile(filePath);
});

export default router;
