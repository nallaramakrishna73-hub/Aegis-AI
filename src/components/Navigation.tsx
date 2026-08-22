import React from 'react';
import {
  ShieldAlert,
  MessageSquareCode,
  LayoutDashboard,
  Activity,
  Bug,
  FileSpreadsheet,
  KeyRound,
  Wrench,
  PlusCircle,
  FileCode,
  Terminal,
  Lock
} from 'lucide-react';

export type ActiveTab =
  | 'chat'
  | 'dashboard'
  | 'scans'
  | 'vulnerabilities'
  | 'reports'
  | 'authorizations'
  | 'tools';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  vulnerabilityCount: number;
  activeScanCount: number;
  onOpenNewScan: () => void;
  onOpenAnalyzeRaw: () => void;
  onOpenAuthorization: () => void;
  selectedTarget: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  vulnerabilityCount,
  activeScanCount,
  onOpenNewScan,
  onOpenAnalyzeRaw,
  onOpenAuthorization,
  selectedTarget
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950 border-b border-slate-800/80 text-slate-100 backdrop-blur-md">
      {/* Top branding & controls bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 via-blue-600 to-cyan-500 p-0.5 shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-wider text-base uppercase bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  AEGIS-AI
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold tracking-widest bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 rounded">
                  VAPT COPILOT
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping"></span>
                <span>SYSTEM ONLINE · MULTI-AGENT RUNTIME</span>
              </p>
            </div>
          </div>

          {/* Quick Target Indicator & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {selectedTarget && (
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-300">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-400">Target:</span>
                <span className="text-cyan-300 font-semibold truncate max-w-[160px]">{selectedTarget}</span>
              </div>
            )}

            <button
              id="btn-auth-scope"
              onClick={onOpenAuthorization}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-lg transition"
              title="Manage Target Permissions & Scope"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Authorizations</span>
            </button>

            <button
              id="btn-analyze-raw"
              onClick={onOpenAnalyzeRaw}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-lg transition"
              title="Analyze Nmap, ZAP or HTTP Response text"
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Analyze Output</span>
            </button>

            <button
              id="btn-new-scan"
              onClick={onOpenNewScan}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg shadow-md shadow-blue-500/20 transition transform active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Launch Scan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Tab Navigation Bar */}
      <div className="border-t border-slate-800/80 bg-slate-950/60 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-1.5 scrollbar-none">
            <button
              id="nav-tab-chat"
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition ${
                activeTab === 'chat'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <MessageSquareCode className="w-4 h-4" />
              <span>AI Copilot</span>
            </button>

            <button
              id="nav-tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Security Dashboard</span>
            </button>

            <button
              id="nav-tab-scans"
              onClick={() => setActiveTab('scans')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition ${
                activeTab === 'scans'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Active Scans</span>
              {activeScanCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold bg-blue-500/30 text-blue-300 rounded-full border border-blue-400/40 animate-pulse">
                  {activeScanCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-vulnerabilities"
              onClick={() => setActiveTab('vulnerabilities')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition ${
                activeTab === 'vulnerabilities'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Bug className="w-4 h-4" />
              <span>Vulnerabilities</span>
              {vulnerabilityCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold bg-rose-500/20 text-rose-300 rounded-full border border-rose-500/30">
                  {vulnerabilityCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-reports"
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition ${
                activeTab === 'reports'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>VAPT Reports</span>
            </button>

            <button
              id="nav-tab-authorizations"
              onClick={() => setActiveTab('authorizations')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition ${
                activeTab === 'authorizations'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Target Scope & Auth</span>
            </button>

            <button
              id="nav-tab-tools"
              onClick={() => setActiveTab('tools')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition ${
                activeTab === 'tools'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Tools Catalog</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
