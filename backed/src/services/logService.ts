import { v4 as uuid } from 'uuid';
import { SecurityEvent } from '../models/threat.js';
import { loadJson, saveJson } from '../utils/storage.js';

const LOG_STORAGE = 'events.json';

export class LogService {
  getEvents(): SecurityEvent[] {
    return loadJson<SecurityEvent[]>(LOG_STORAGE, []);
  }

  ingestLog(raw: string, source: string): SecurityEvent {
    const event: SecurityEvent = {
      id: uuid(),
      source,
      type: 'raw',
      timestamp: new Date().toISOString(),
      raw,
      metadata: {},
    };
    const events = this.getEvents();
    events.push(event);
    saveJson(LOG_STORAGE, events);
    return event;
  }
}
