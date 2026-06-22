import React from 'react';
import { ThreatSummary } from '../types/index.js';

interface RiskChartProps {
  summary: ThreatSummary | null;
  loading: boolean;
}

export function RiskChart({ summary, loading }: RiskChartProps) {
  if (!summary) return null;

  const total = summary.totalAlerts || 1;
  const risks = summary.riskDistribution;
  const low = (risks.low / total) * 100;
  const medium = (risks.medium / total) * 100;
  const high = (risks.high / total) * 100;
  const critical = (risks.critical / total) * 100;

  return (
    <div className="card-glow p-6">
      <h3 className="text-lg font-semibold text-slate-100 mb-4">Risk Distribution</h3>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-300">🟢 Low</span>
            <span className="text-slate-400">{risks.low}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${low}%` }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-300">🟡 Medium</span>
            <span className="text-slate-400">{risks.medium}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${medium}%` }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-300">🟠 High</span>
            <span className="text-slate-400">{risks.high}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${high}%` }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-300">🔴 Critical</span>
            <span className="text-slate-400">{risks.critical}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div className="bg-red-500 h-2 rounded-full" style={{ width: `${critical}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
