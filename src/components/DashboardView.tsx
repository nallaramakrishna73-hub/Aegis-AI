import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  Bug,
  Globe,
  Lock,
  Server,
  Zap,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { ScanJob, SecurityFinding, AuthorizationRecord } from '../types';

interface DashboardViewProps {
  scans: ScanJob[];
  findings: SecurityFinding[];
  authorizations: AuthorizationRecord[];
  onLaunchScanType: (type: ScanJob['scanType']) => void;
  onSelectScan: (scanId: string) => void;
  onSelectFinding: (finding: SecurityFinding) => void;
  onNavigateToTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  scans,
  findings,
  authorizations,
  onLaunchScanType,
  onSelectScan,
  onSelectFinding,
  onNavigateToTab
}) => {
  // Aggregate statistics
  const latestScan = scans[0];
  const securityScore = latestScan ? latestScan.securityScore : 88;

  const criticalCount = findings.filter(f => f.severity === 'Critical').length;
  const highCount = findings.filter(f => f.severity === 'High').length;
  const mediumCount = findings.filter(f => f.severity === 'Medium').length;
  const lowCount = findings.filter(f => f.severity === 'Low').length;
  const infoCount = findings.filter(f => f.severity === 'Informational').length;

  const uniqueAssets = new Set(scans.map(s => s.target));
  const activeScans = scans.filter(s => s.status === 'running' || s.status === 'queued');

  const getScoreGrade = (score: number) => {
    if (score >= 90) return { grade: 'A', label: 'EXCELLENT POSTURE', color: 'text-emerald-400', stroke: '#10b981' };
    if (score >= 75) return { grade: 'B', label: 'GOOD DEFENSE', color: 'text-blue-400', stroke: '#3b82f6' };
    if (score >= 60) return { grade: 'C', label: 'MODERATE RISK', color: 'text-amber-400', stroke: '#f59e0b' };
    if (score >= 40) return { grade: 'D', label: 'HIGH RISK', color: 'text-orange-400', stroke: '#f97316' };
    return { grade: 'F', label: 'CRITICAL EXPOSURE', color: 'text-rose-400', stroke: '#f43f5e' };
  };

  const scoreInfo = getScoreGrade(securityScore);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-slate-100">
      {/* Top Banner: Security Score & Executive Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Security Score Widget */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
              AGGREGATE SECURITY POSTURE
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
              securityScore >= 75 ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30' : 'bg-amber-950/80 text-amber-400 border border-amber-500/30'
            }`}>
              GRADE {scoreInfo.grade}
            </span>
          </div>

          <div className="my-5 flex items-center gap-6">
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  strokeDasharray={`${securityScore}, 100`}
                  stroke={scoreInfo.stroke}
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold font-mono text-white">
                  {securityScore}
                </span>
                <span className="text-[10px] font-mono text-slate-400">/ 100</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className={`font-mono text-sm font-bold tracking-wider ${scoreInfo.color}`}>
                {scoreInfo.label}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Calculated across {scans.length} automated VAPT assessments and {findings.length} correlated findings.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Latest: {latestScan ? latestScan.target : 'testphp.vulnweb.com'}</span>
            <button
              onClick={() => onNavigateToTab('reports')}
              className="text-cyan-400 hover:underline inline-flex items-center gap-1 font-medium"
            >
              <span>View Full Report</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Findings Severity Matrix */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bug className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                ACTIVE VULNERABILITY BREAKDOWN
              </span>
            </div>
            <button
              onClick={() => onNavigateToTab('vulnerabilities')}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>Explore All ({findings.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Critical */}
            <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-300">Critical</span>
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              </div>
              <div className="text-2xl font-extrabold font-mono text-rose-400 my-1">
                {criticalCount}
              </div>
              <span className="text-[11px] text-slate-400">CVSS 9.0 - 10.0</span>
            </div>

            {/* High */}
            <div className="p-3.5 rounded-xl bg-orange-950/20 border border-orange-500/30 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-orange-300">High</span>
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              </div>
              <div className="text-2xl font-extrabold font-mono text-orange-400 my-1">
                {highCount}
              </div>
              <span className="text-[11px] text-slate-400">CVSS 7.0 - 8.9</span>
            </div>

            {/* Medium */}
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-300">Medium</span>
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              </div>
              <div className="text-2xl font-extrabold font-mono text-amber-400 my-1">
                {mediumCount}
              </div>
              <span className="text-[11px] text-slate-400">CVSS 4.0 - 6.9</span>
            </div>

            {/* Low & Info */}
            <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/30 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-300">Low / Info</span>
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              </div>
              <div className="text-2xl font-extrabold font-mono text-blue-400 my-1">
                {lowCount + infoCount}
              </div>
              <span className="text-[11px] text-slate-400">CVSS 0.1 - 3.9</span>
            </div>
          </div>

          {/* Quick Scope Summary */}
          <div className="pt-4 mt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>{uniqueAssets.size || 1} Targets In Scope</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>{scans.length} Scans Executed</span>
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>{authorizations.length} Active Permissions</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Launch Workflows Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
              QUICK SECURITY WORKFLOW LAUNCHERS
            </span>
          </div>
          <span className="text-xs text-slate-500 font-mono">Select a pre-approved security profile</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <button
            onClick={() => onLaunchScanType('web_vapt')}
            className="p-3 bg-slate-950/80 hover:bg-blue-600/20 border border-slate-800 hover:border-blue-500/40 rounded-xl transition text-left group"
          >
            <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 mb-1">
              Full Web VAPT
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Headers, SSL, OWASP ZAP, injections, sensitive paths.
            </p>
          </button>

          <button
            onClick={() => onLaunchScanType('network_ports')}
            className="p-3 bg-slate-950/80 hover:bg-blue-600/20 border border-slate-800 hover:border-blue-500/40 rounded-xl transition text-left group"
          >
            <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 mb-1">
              Port & Service Scan
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Safe SYN/TCP port probing and database exposure checks.
            </p>
          </button>

          <button
            onClick={() => onLaunchScanType('ssl_audit')}
            className="p-3 bg-slate-950/80 hover:bg-blue-600/20 border border-slate-800 hover:border-blue-500/40 rounded-xl transition text-left group"
          >
            <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 mb-1">
              SSL/TLS Audit
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Cert validity, cipher suite evaluation, and TLS versions.
            </p>
          </button>

          <button
            onClick={() => onLaunchScanType('api_security')}
            className="p-3 bg-slate-950/80 hover:bg-blue-600/20 border border-slate-800 hover:border-blue-500/40 rounded-xl transition text-left group"
          >
            <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 mb-1">
              API Security
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Swagger schema, HTTP verbs, and unauthenticated endpoints.
            </p>
          </button>

          <button
            onClick={() => onLaunchScanType('quick_recon')}
            className="p-3 bg-slate-950/80 hover:bg-blue-600/20 border border-slate-800 hover:border-blue-500/40 rounded-xl transition text-left group"
          >
            <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 mb-1">
              Passive Recon
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              CMS detection, server fingerprinting, and robots audit.
            </p>
          </button>
        </div>
      </div>

      {/* Main Content Grid: Top Vulnerabilities + Recent Scans Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top High-Priority Vulnerabilities */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
                CRITICAL & HIGH PRIORITY FINDINGS
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Ordered by CVSS v3.1 Severity
            </span>
          </div>

          <div className="space-y-2.5">
            {findings.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-mono">
                No vulnerabilities detected. Run a scan to populate findings.
              </div>
            ) : (
              findings.slice(0, 5).map((finding) => (
                <div
                  key={finding.id}
                  onClick={() => onSelectFinding(finding)}
                  className="p-3.5 bg-slate-950/70 hover:bg-slate-850 border border-slate-800/90 hover:border-slate-700 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded shrink-0 font-mono mt-0.5 ${
                      finding.severity === 'Critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : finding.severity === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : finding.severity === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {finding.severity}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-200 group-hover:text-cyan-400 transition truncate">
                        {finding.title}
                      </div>
                      <div className="text-xs text-slate-400 truncate mt-0.5">
                        {finding.affectedAsset}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-slate-300">CVSS {finding.cvss}</span>
                      <div className="text-[10px] font-mono text-slate-500">{finding.tool}</div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Scans Activity */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
                  RECENT SCANS
                </span>
              </div>
              <button
                onClick={() => onNavigateToTab('scans')}
                className="text-xs text-cyan-400 hover:underline"
              >
                View all →
              </button>
            </div>

            <div className="space-y-2.5">
              {scans.slice(0, 4).map((scan) => (
                <div
                  key={scan.id}
                  onClick={() => onSelectScan(scan.id)}
                  className="p-3 bg-slate-950/70 hover:bg-slate-850 border border-slate-800 rounded-xl cursor-pointer transition text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 truncate max-w-[160px]">{scan.target}</span>
                    <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded font-mono ${
                      scan.status === 'completed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : scan.status === 'running' ? 'bg-blue-950 text-blue-400 border border-blue-800 animate-pulse'
                      : scan.status === 'cancelled' ? 'bg-slate-800 text-slate-400 border border-slate-700'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}>
                      {scan.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
                    <span>Score: {scan.securityScore}/100</span>
                    <span>{scan.findings.length} findings</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-center">
            <button
              onClick={() => onNavigateToTab('chat')}
              className="w-full py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-semibold transition"
            >
              Ask AI Security Copilot →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
