import { ThreatRecord, ThreatSummary, RiskLevel } from '../models/threat.js';

const riskScoreMap: Record<RiskLevel, number> = {
  low: 10,
  medium: 40,
  high: 70,
  critical: 90,
};

export class RiskService {
  calculateRisk(threat: ThreatRecord) {
    const score = threat.severityScore + riskScoreMap[threat.risk];
    const normalized = Math.min(100, Math.max(0, score));
    const level = this.levelFromScore(normalized);
    return {
      ...threat,
      risk: level,
      severityScore: normalized,
    };
  }

  buildSummary(threats: ThreatRecord[]): ThreatSummary {
    const distribution = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    } as Record<RiskLevel, number>;
    threats.forEach((threat) => distribution[threat.risk]++);
    const topSources = Object.entries(
      threats.reduce<Record<string, number>>((acc, threat) => {
        acc[threat.sourceIp] = (acc[threat.sourceIp] || 0) + 1;
        return acc;
      }, {}),
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([sourceIp, count]) => ({ sourceIp, count }));

    return {
      totalAlerts: threats.length,
      highRisk: distribution.high,
      criticalRisk: distribution.critical,
      activeIncidents: threats.filter((t) => t.status !== 'resolved').length,
      riskDistribution: distribution,
      topSources,
    };
  }

  private levelFromScore(score: number): RiskLevel {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 35) return 'medium';
    return 'low';
  }
}
