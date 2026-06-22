import React from 'react';

interface StatusPanelProps {
  summaryLoaded: boolean;
}

export function StatusPanel({ summaryLoaded }: StatusPanelProps) {
  return (
    <div className="card-glow p-6">
      <h3 className="text-lg font-semibold text-slate-100 mb-4">Aegis-AI Status</h3>
      <div className="grid grid-cols-1 gap-3">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-700">
          <p className="text-slate-400 text-sm">Lifecycle</p>
          <p className="text-slate-100 font-semibold">Monitoring</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-700">
          <p className="text-slate-400 text-sm">Data Streams</p>
          <p className="text-slate-100 font-semibold">Live Logs + Alerts</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-700">
          <p className="text-slate-400 text-sm">Cluster</p>
          <p className="text-slate-100 font-semibold">Secure Mode</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-700">
          <p className="text-slate-400 text-sm">Dashboard</p>
          <p className="text-slate-100 font-semibold">{summaryLoaded ? 'Ready' : 'Loading'}</p>
        </div>
      </div>
    </div>
  );
}
