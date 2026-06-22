import React from 'react';
import { ThreatRecord } from '../types/index.js';

interface ThreatTrendsProps {
  threats: ThreatRecord[];
}

export function ThreatTrends({ threats }: ThreatTrendsProps) {
  const counts = threats.reduce<Record<string, number>>((acc, threat) => {
    const date = new Date(threat.detectedAt).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const entries = Object.entries(counts).sort(([a], [b]) => a.localeCompare(b));
  const maxCount = Math.max(...entries.map(([, count]) => count), 1);

  return (
    <div className="card-glow p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Threat Trends</h3>
          <p className="text-slate-400 text-sm">Recent detection volume over time.</p>
        </div>
      </div>
      <div className="space-y-3">
        {entries.length === 0 ? (
          <p className="text-slate-400">No threat trend data available.</p>
        ) : (
          entries.map(([date, count]) => (
            <div key={date}> 
              <div className="flex justify-between text-sm text-slate-300 mb-1">
                <span>{date}</span>
                <span>{count} alert{count === 1 ? '' : 's'}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-dark-500 to-dark-700 h-3 rounded-full"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
