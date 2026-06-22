import { ThreatRecord } from '../models/threat.js';

export class AnalysisService {
  analyzeThreat(threat: ThreatRecord) {
    return {
      attackType: threat.type,
      severity: threat.risk,
      explanation: `${threat.description} This threat is rated ${threat.risk}.`, 
      likelyCause: this.likelyCause(threat.type),
    };
  }

  classifyFromLog(raw: string) {
    const lower = raw.toLowerCase();
    if (/failed ssh login|authentication failure|invalid user|failed password/.test(lower)) {
      return 'Possible Brute Force Attack';
    }
    if (/nmap|port scan|scan tcp|scan udp|xmas scan|syn scan/.test(lower)) {
      return 'Possible Port Scanning';
    }
    if (/malware|trojan|ransomware|suspicious executable|command and control|c2/.test(lower)) {
      return 'Possible Malware Activity';
    }
    if (/login from unknown|new device|geoip|unrecognized location|unauthorized access/.test(lower)) {
      return 'Possible Unauthorized Access';
    }
    if (/spike|unusually high|bandwidth usage|traffic anomaly|abnormal traffic/.test(lower)) {
      return 'Possible Network Anomaly';
    }
    return 'Unclassified event';
  }

  private likelyCause(type: string) {
    if (type === 'brute_force') {
      return 'Repeated login attempts from the same source.';
    }
    if (type === 'port_scan') {
      return 'A scan tool is probing open ports.';
    }
    if (type === 'malware') {
      return 'Malicious software or compromised host activity.';
    }
    if (type === 'unauthorized_access') {
      return 'Login from an unexpected location or device.';
    }
    if (type === 'network_anomaly') {
      return 'Abnormal traffic patterns in the network.';
    }
    return 'No clear cause determined.';
  }
}
