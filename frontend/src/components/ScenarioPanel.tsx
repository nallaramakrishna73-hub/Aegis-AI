import React from 'react';
import { api } from '../services/api.js';

interface ScenarioPanelProps {
  onScenarioAdded: () => void;
}

const scenarios = [
  {
    label: 'Brute Force Attack',
    raw: 'Failed SSH login attempt from 192.168.1.100 multiple times',
    source: 'ssh',
  },
  {
    label: 'Port Scanning',
    raw: 'Nmap scan detected from 10.0.0.5 targeting multiple ports',
    source: 'network',
  },
  {
    label: 'Suspicious Login',
    raw: 'Login from unknown location detected for user admin',
    source: 'authentication',
  },
];

export function ScenarioPanel({ onScenarioAdded }: ScenarioPanelProps) {
  const handleAdd = async (raw: string, source: string) => {
    await api.ingestLog(raw, source);
    onScenarioAdded();
  };

  return (
    <div className="card-glow p-6">
      <h3 className="text-lg font-semibold text-slate-100 mb-4">Demo Scenarios</h3>
      <p className="text-slate-400 text-sm mb-4">
        Inject demo events to simulate real threat detection and response.
      </p>
      <div className="space-y-3">
        {scenarios.map((scenario) => (
          <button
            key={scenario.label}
            onClick={() => handleAdd(scenario.raw, scenario.source)}
            className="btn-secondary w-full text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-100">{scenario.label}</p>
                <p className="text-slate-400 text-sm">{scenario.raw}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
