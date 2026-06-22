import React from 'react';
import { ThreatRecord } from '../types/index.js';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface ThreatTableProps {
  threats: ThreatRecord[];
  loading: boolean;
}

function getRiskColor(risk: string) {
  switch (risk) {
    case 'critical':
      return 'risk-critical';
    case 'high':
      return 'risk-high';
    case 'medium':
      return 'risk-medium';
    default:
      return 'risk-low';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'new':
      return <AlertCircle className="w-4 h-4 text-blue-400" />;
    case 'investigating':
      return <Clock className="w-4 h-4 text-yellow-400" />;
    case 'resolved':
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    default:
      return null;
  }
}

export function ThreatTable({ threats, loading }: ThreatTableProps) {
  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-slate-100">Active Threats</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900 text-slate-300 text-sm">
            <tr className="border-b border-slate-700">
              <th className="px-6 py-3 text-left font-semibold">Type</th>
              <th className="px-6 py-3 text-left font-semibold">Source IP</th>
              <th className="px-6 py-3 text-left font-semibold">Risk Level</th>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
              <th className="px-6 py-3 text-left font-semibold">Score</th>
              <th className="px-6 py-3 text-left font-semibold">Detected</th>
            </tr>
          </thead>
          <tbody className={loading ? 'opacity-50' : ''}>
            {threats.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  No threats detected. Your system looks healthy!
                </td>
              </tr>
            ) : (
              threats.map((threat) => (
                <tr
                  key={threat.id}
                  className="border-b border-slate-700 hover:bg-slate-800 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-100">
                      {threat.type.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300 font-mono text-sm">{threat.sourceIp}</td>
                  <td className="px-6 py-4">
                    <span className={`risk-badge ${getRiskColor(threat.risk)}`}>
                      {threat.risk.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(threat.status)}
                      <span className="text-slate-300 capitalize">{threat.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-16 bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-dark-500 h-2 rounded-full"
                        style={{ width: `${threat.severityScore}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {new Date(threat.detectedAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
