import { v4 as uuid } from 'uuid';
import { LogService } from './logService.js';
import { loadJson, saveJson } from '../utils/storage.js';
import { SecurityEvent, ThreatRecord, RiskLevel } from '../models/threat.js';

const THREAT_STORAGE = 'threats.json';

const riskMap: Record<string, RiskLevel> = {
  'brute_force': 'high',
  'port_scan': 'medium',
  'malware': 'critical',
  'unauthorized_access': 'high',
  'network_anomaly': 'medium',
  'unknown': 'low',
};

export class ThreatDetectionService {
  private logService = new LogService();

  getThreats(): ThreatRecord[] {
    return loadJson<ThreatRecord[]>(THREAT_STORAGE, []);
  }

  analyzeEvent(event: SecurityEvent): ThreatRecord | null {
    const raw = event.raw.toLowerCase();
    const match = this.matchThreat(raw);
    if (!match) {
      return null;
    }
    const threat: ThreatRecord = {
      id: uuid(),
      eventId: event.id,
      type: match.type,
      description: match.description,
      sourceIp: match.sourceIp,
      detectedAt: new Date().toISOString(),
      risk: riskMap[match.type] ?? 'low',
      severityScore: match.score,
      status: 'new',
      recommendations: this.suggestRecommendations(match.type),
      translatedAlert: this.translateAlert(match.type, raw),
    };
    const threats = this.getThreats();
    threats.push(threat);
    saveJson(THREAT_STORAGE, threats);
    return threat;
  }

  detectAll() {
    const events = this.logService.getEvents();
    const threats = events
      .map((event) => this.analyzeEvent(event))
      .filter((threat): threat is ThreatRecord => threat !== null);
    return threats;
  }

  private matchThreat(raw: string) {
    const sourceIp = this.extractIp(raw) ?? 'unknown';
    if (/failed ssh login|authentication failure|invalid user|failed password/.test(raw)) {
      return {
        type: 'brute_force',
        description: 'Repeated failed SSH login attempts indicate a possible brute force attack.',
        sourceIp,
        score: 70,
      };
    }
    if (/nmap|port scan|scan tcp|scan udp|xmas scan|syn scan/.test(raw)) {
      return {
        type: 'port_scan',
        description: 'A single source appears to be scanning multiple ports on your network.',
        sourceIp,
        score: 45,
      };
    }
    if (/malware|trojan|ransomware|suspicious executable|command and control|c2/.test(raw)) {
      return {
        type: 'malware',
        description: 'Suspicious executable activity may indicate malware or an active infection.',
        sourceIp,
        score: 90,
      };
    }
    if (/login from unknown|new device|geoip|unrecognized location|unauthorized access/.test(raw)) {
      return {
        type: 'unauthorized_access',
        description: 'Access from an unfamiliar location or device may be unauthorized.',
        sourceIp,
        score: 80,
      };
    }
    if (/spike|unusually high|bandwidth usage|traffic anomaly|abnormal traffic/.test(raw)) {
      return {
        type: 'network_anomaly',
        description: 'Traffic patterns are abnormal, suggesting possible network anomaly or attack.',
        sourceIp,
        score: 60,
      };
    }
    return null;
  }

  private extractIp(raw: string) {
    const match = raw.match(/(\d{1,3}(?:\.\d{1,3}){3})/);
    return match?.[1] ?? null;
  }

  private suggestRecommendations(type: string) {
    if (type === 'brute_force') {
      return ['Change passwords', 'Enable MFA', 'Block suspicious IP', 'Monitor login attempts'];
    }
    if (type === 'port_scan') {
      return ['Restrict public port access', 'Inspect firewall rules', 'Block scanning IP', 'Monitor network traffic'];
    }
    if (type === 'malware') {
      return ['Isolate affected systems', 'Run malware scans', 'Update endpoint protection', 'Review suspicious processes'];
    }
    if (type === 'unauthorized_access') {
      return ['Verify user identity', 'Invalidate suspicious sessions', 'Update access policies', 'Monitor future access'];
    }
    if (type === 'network_anomaly') {
      return ['Check bandwidth usage', 'Inspect network logs', 'Validate firewall policies', 'Review recent traffic spikes'];
    }
    return ['Review event details', 'Increase monitoring', 'Validate source authenticity'];
  }

  private translateAlert(type: string, raw: string) {
    if (type === 'brute_force') {
      return 'Someone is repeatedly trying to guess your password.';
    }
    if (type === 'port_scan') {
      return 'A device is scanning multiple ports on your network.';
    }
    if (type === 'malware') {
      return 'Suspicious software activity may indicate malware.';
    }
    if (type === 'unauthorized_access') {
      return 'A login was detected from an unfamiliar location or device.';
    }
    if (type === 'network_anomaly') {
      return 'Network traffic looks abnormal, which may be a sign of an attack.';
    }
    return `Alert generated from log: ${raw}`;
  }
}
