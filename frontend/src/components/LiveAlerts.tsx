import React from 'react';
import { ThreatRecord } from '../types/index.js';
import { BellRing } from 'lucide-react';

interface LiveAlertsProps {
  threat: ThreatRecord | null;
}

export function LiveAlerts({ threat }: LiveAlertsProps) {
  if (!threat) {
    return (
      <div className="card-glow p-6">
        <div className="flex items-center gap-3 mb-4">
          <BellRing className="w-5 h-5 text-dark-400" />
          <h3 className="text-lg font-semibold text-slate-100">Live Alerts</h3>
        </div>
        <p className="text-slate-400">No live alerts received yet.</p>
      </div>
    );
  }

  return (
    <div className="card-glow p-6">
      <div className="flex items-center gap-3 mb-4">
        <BellRing className="w-5 h-5 text-dark-400" />
        <h3 className="text-lg font-semibold text-slate-100">Live Alert</h3>
      </div>
      <div className="space-y-3">
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <p className="text-sm text-slate-400">Latest threat detected</p>
          <p className="text-slate-100 font-semibold mt-2">{threat.type.replace(/_/g, ' ').toUpperCase()}</p>
          <p className="text-slate-400 text-sm mt-1">{threat.description}</p>
          <p className="text-slate-400 text-xs mt-2">Source: {threat.sourceIp}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="card p-4 bg-slate-900 border border-slate-700">
            <p className="text-slate-400 text-xs">Risk</p>
            <p className="text-slate-100 font-semibold">{threat.risk.toUpperCase()}</p>
          </div>
          <div className="card p-4 bg-slate-900 border border-slate-700">
            <p className="text-slate-400 text-xs">Score</p>
            <p className="text-slate-100 font-semibold">{threat.severityScore}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
