import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { ThreatRecord } from '../types/index.js';
import { AlertCircle, ChevronDown } from 'lucide-react';

export function Threats() {
  const [threats, setThreats] = useState<ThreatRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchThreats();
  }, []);

  const fetchThreats = async () => {
    try {
      const data = await api.getThreats();
      setThreats(data);
    } catch (error) {
      console.error('Failed to fetch threats:', error);
    } finally {
      setLoading(false);
    }
  };

  function getRiskColor(risk: string) {
    switch (risk) {
      case 'critical': return 'bg-red-900 text-red-200';
      case 'high': return 'bg-orange-900 text-orange-200';
      case 'medium': return 'bg-yellow-900 text-yellow-200';
      default: return 'bg-emerald-900 text-emerald-200';
    }
  }

  function getRiskBadgeBackground(risk: string) {
    switch (risk) {
      case 'critical': return 'bg-red-900';
      case 'high': return 'bg-orange-900';
      case 'medium': return 'bg-yellow-900';
      default: return 'bg-emerald-900';
    }
  }

  function getRiskIconColor(risk: string) {
    switch (risk) {
      case 'critical': return 'text-red-200';
      case 'high': return 'text-orange-200';
      case 'medium': return 'text-yellow-200';
      default: return 'text-emerald-200';
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-dark-400">Threat intelligence</p>
          <h1 className="text-3xl font-bold text-slate-100 mt-3">Threat Intelligence</h1>
          <p className="text-slate-400 mt-2 max-w-2xl">View detected incidents, source patterns, and actionable guidance for remediation.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-3xl bg-slate-900 border border-slate-700 px-4 py-3 shadow-glow">
          <span className="text-xs uppercase tracking-[0.2em] text-dark-400">Live</span>
          <span className="text-slate-100 font-semibold">Real-time insights</span>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="card p-8 text-center text-slate-400">Loading threats...</div>
        ) : threats.length === 0 ? (
          <div className="card-glow p-8 text-center">
            <AlertCircle className="w-12 h-12 text-dark-400 mx-auto mb-4 opacity-50" />
            <p className="text-slate-300 font-medium">No threats detected</p>
            <p className="text-slate-400 text-sm mt-1">Your system is secure</p>
          </div>
        ) : (
          threats.map((threat) => (
            <div
              key={threat.id}
              className="card-glow overflow-hidden"
            >
              <button
              onClick={() => setExpandedId(expandedId === threat.id ? null : threat.id)}
              className="w-full px-6 py-4 flex items-center justify-between rounded-3xl bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-all"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`p-3 rounded-3xl ${getRiskBadgeBackground(threat.risk)} bg-opacity-15`}>
                  <AlertCircle className={`w-5 h-5 ${getRiskIconColor(threat.risk)}`} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-100">{threat.type.replace(/_/g, ' ').toUpperCase()}</p>
                  <p className="text-sm text-slate-400">{threat.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`risk-badge ${getRiskColor(threat.risk)} uppercase tracking-[0.18em]`}>
                  {threat.risk}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform ${
                    expandedId === threat.id ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

              {expandedId === threat.id && (
                <div className="px-6 py-4 bg-slate-900 border-t border-slate-700 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-400">Source IP</p>
                      <p className="font-mono text-slate-100">{threat.sourceIp}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Detected At</p>
                      <p className="text-slate-100">{new Date(threat.detectedAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Severity Score</p>
                      <p className="text-slate-100">{threat.severityScore.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Status</p>
                      <p className="capitalize text-slate-100">{threat.status}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400 mb-2">Translation (Simple Language)</p>
                    <p className="text-slate-100 bg-slate-800 p-3 rounded-lg">{threat.translatedAlert}</p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400 mb-2">Recommendations</p>
                    <ul className="space-y-2">
                      {threat.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-slate-100 flex items-start gap-2">
                          <span className="text-dark-400 font-bold">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
