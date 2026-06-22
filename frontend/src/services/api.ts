import axios from 'axios';
import { ThreatRecord, ThreatSummary, SecurityEvent } from '../types/index.js';

const API_URL = '/api';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  async getStatus() {
    const { data } = await client.get('/status');
    return data;
  },

  async ingestLog(raw: string, source: string) {
    const { data } = await client.post('/logs', { raw, source });
    return data;
  },

  async getThreats() {
    const { data } = await client.get<{ threats: ThreatRecord[] }>('/threats');
    return data.threats;
  },

  async getSummary() {
    const { data } = await client.get<{ summary: ThreatSummary }>('/summary');
    return data.summary;
  },

  async chat(question: string) {
    const { data } = await client.post('/chat', { question });
    return data.answer;
  },

  async generateReport(format: 'pdf' | 'docx') {
    const { data } = await client.post('/reports', { format });
    return data;
  },

  async getEvents() {
    const { data } = await client.get<{ events: SecurityEvent[] }>('/events');
    return data.events;
  },

  async detectAll() {
    const { data } = await client.post('/detect-all', {});
    return data;
  },
};
