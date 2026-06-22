import React from 'react';
import { Shield, AlertCircle, Menu } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-slate-900 border-b border-slate-700 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-dark-500 to-dark-700 rounded-2xl shadow-glow">
            <Shield className="w-6 h-6 text-dark-100" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-dark-400">Aegis-AI 🛡️</h1>
            <p className="text-sm text-slate-400">Proactive threat detection with modern security insights</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <div className="w-2 h-2 bg-dark-400 rounded-full animate-pulse"></div>
            <span>Live Monitoring</span>
          </div>
        </div>
        <button className="md:hidden text-slate-400 hover:text-slate-100">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
}
