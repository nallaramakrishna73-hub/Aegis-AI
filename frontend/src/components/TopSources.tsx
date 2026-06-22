import React from 'react';
import { ThreatSummary } from '../types/index.js';
import { Globe } from 'lucide-react';

interface TopSourcesProps {
  summary: ThreatSummary | null;
  loading: boolean;
}

export function TopSources({ summary, loading }: TopSourcesProps) {
  if (!summary || !summary.topSources) return null;

  const maxCount = Math.max(...summary.topSources.map((s) => s.count), 1);

  return (
    <div className="card-glow p-6">
      <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
        <Globe className="w-5 h-5 text-dark-400" />
        Top Attack Sources
      </h3>
      <div className="space-y-3">
        {summary.topSources.length === 0 ? (
          <p className="text-slate-400 text-sm">No attack sources detected</p>
        ) : (
          summary.topSources.map((source) => (
            <div key={source.sourceIp} className="flex items-center gap-3">
              <div className="flex-1">
                <p className="font-mono text-sm text-slate-300">{source.sourceIp}</p>
                <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
                  <div
                    className="bg-gradient-to-r from-dark-500 to-dark-600 h-1.5 rounded-full"
                    style={{ width: `${(source.count / maxCount) * 100}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-slate-400 font-semibold text-sm">{source.count}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
