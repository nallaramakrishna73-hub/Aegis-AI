export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ThreatRecord {
  id: string;
  eventId: string;
  type: string;
  description: string;
  sourceIp: string;
  detectedAt: string;
  risk: RiskLevel;
  severityScore: number;
  status: 'new' | 'investigating' | 'resolved';
  recommendations: string[];
  translatedAlert: string;
}

export interface ThreatSummary {
  totalAlerts: number;
  highRisk: number;
  criticalRisk: number;
  activeIncidents: number;
  riskDistribution: Record<RiskLevel, number>;
  topSources: Array<{ sourceIp: string; count: number }>;
}

export interface SecurityEvent {
  id: string;
  source: string;
  type: string;
  timestamp: string;
  raw: string;
  metadata: Record<string, unknown>;
}
