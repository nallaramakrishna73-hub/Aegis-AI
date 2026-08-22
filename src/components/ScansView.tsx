import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Play,
  StopCircle,
  Terminal,
  FileText,
  Bug,
  ChevronRight,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
  Download
} from 'lucide-react';
import { ScanJob, WorkflowStep, SecurityFinding } from '../types';
import { api } from '../services/api';

interface ScansViewProps {
  scans: ScanJob[];
  selectedScanId: string | null;
  onSelectScan: (id: string) => void;
  onLaunchNewScan: () => void;
  onSelectFinding: (finding: SecurityFinding) => void;
  onNavigateToReports: (reportId?: string) => void;
}

export const ScansView: React.FC<ScansViewProps> = ({
  scans,
  selectedScanId,
  onSelectScan,
  onLaunchNewScan,
  onSelectFinding,
  onNavigateToReports
}) => {
  const [currentScan, setCurrentScan] = useState<ScanJob | null>(null);
  const [activeStepTab, setActiveStepTab] = useState<string>('workflow');
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Sync selected scan
  useEffect(() => {
    if (selectedScanId) {
      const scan = scans.find(s => s.id === selectedScanId);
      if (scan) {
        setCurrentScan(scan);
        if (scan.workflow.length > 0 && !selectedStep) {
          setSelectedStep(scan.workflow[0]);
        }
      }
    } else if (scans.length > 0 && !currentScan) {
      setCurrentScan(scans[0]);
      onSelectScan(scans[0].id);
    }
  }, [selectedScanId, scans]);

  // Connect SSE live stream for real-time updates when scan is active
  useEffect(() => {
    if (!currentScan || currentScan.status === 'completed' || currentScan.status === 'failed' || currentScan.status === 'cancelled') {
      return;
    }

    const eventSource = new EventSource(`/api/scans/${currentScan.id}/stream`);

    eventSource.addEventListener('initial_state', (e) => {
      try {
        const data = JSON.parse(e.data);
        setCurrentScan(data);
      } catch (err) {}
    });

    eventSource.addEventListener('step_update', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.scan) {
          setCurrentScan(data.scan);
        }
      } catch (err) {}
    });

    eventSource.addEventListener('status_change', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.scan) {
          setCurrentScan(data.scan);
        }
      } catch (err) {}
    });

    eventSource.addEventListener('scan_complete', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.scan) {
          setCurrentScan(data.scan);
        }
      } catch (err) {}
    });

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [currentScan?.id, currentScan?.status]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentScan?.logs]);

  const handleCancelScan = async () => {
    if (!currentScan) return;
    try {
      await api.cancelScan(currentScan.id);
    } catch (err: any) {
      alert(err.message || 'Failed to cancel scan');
    }
  };

  const getStepStatusIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'running': return <Activity className="w-4 h-4 text-cyan-400 animate-spin" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-rose-400" />;
      default: return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-slate-100">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left column: Scans Directory */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col h-[750px] shadow-lg">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
                SCANS ARCHIVE ({scans.length})
              </span>
            </div>
            <button
              onClick={onLaunchNewScan}
              className="p-1 text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg transition"
              title="Launch new scan"
            >
              + New
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin">
            {scans.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No scans recorded.
              </div>
            ) : (
              scans.map((scan) => (
                <div
                  key={scan.id}
                  onClick={() => {
                    setCurrentScan(scan);
                    onSelectScan(scan.id);
                    if (scan.workflow.length > 0) setSelectedStep(scan.workflow[0]);
                  }}
                  className={`p-3 rounded-xl cursor-pointer transition border text-xs ${
                    scan.id === currentScan?.id
                      ? 'bg-blue-600/20 border-blue-500/50 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-200 truncate max-w-[150px]">
                      {scan.target}
                    </span>
                    <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded font-mono ${
                      scan.status === 'completed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : scan.status === 'running' ? 'bg-blue-950 text-blue-400 border border-blue-800 animate-pulse'
                      : scan.status === 'cancelled' ? 'bg-slate-800 text-slate-400 border border-slate-700'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}>
                      {scan.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>{scan.scanType.replace('_', ' ').toUpperCase()}</span>
                    <span className="font-bold text-cyan-400">{scan.securityScore}/100</span>
                  </div>

                  <div className="mt-1 text-[10px] text-slate-500 flex items-center justify-between">
                    <span>{new Date(scan.startTime).toLocaleTimeString()}</span>
                    <span>{scan.findings.length} findings</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 3 columns: Live Scan Details, Workflow Stepper & Terminal Logs */}
        <div className="lg:col-span-3 space-y-6">
          {currentScan ? (
            <>
              {/* Active Scan Header Banner */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-cyan-400">{currentScan.id}</span>
                      <span className={`px-2 py-0.5 text-xs font-bold rounded font-mono ${
                        currentScan.status === 'completed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : currentScan.status === 'running' ? 'bg-blue-950 text-blue-400 border border-blue-800 animate-pulse'
                        : currentScan.status === 'cancelled' ? 'bg-slate-800 text-slate-400 border border-slate-700'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        STATUS: {currentScan.status.toUpperCase()}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-white">{currentScan.title}</h2>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 mt-2">
                      <span>TARGET: <strong className="text-slate-200">{currentScan.target}</strong></span>
                      <span>SCOPE: <strong className="text-slate-200">{currentScan.targetType.toUpperCase()}</strong></span>
                      <span>STARTED: {new Date(currentScan.startTime).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {currentScan.status === 'running' && (
                      <button
                        onClick={handleCancelScan}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-semibold transition"
                      >
                        <StopCircle className="w-4 h-4" />
                        <span>Cancel Scan</span>
                      </button>
                    )}

                    {currentScan.status === 'completed' && (
                      <button
                        onClick={() => onNavigateToReports(`REP-${currentScan.id}`)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition active:scale-95"
                      >
                        <FileText className="w-4 h-4" />
                        <span>View VAPT Report</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar & Score Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-800">
                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                    <div className="text-[11px] font-mono text-slate-400">SECURITY SCORE</div>
                    <div className="text-2xl font-extrabold font-mono text-cyan-400 mt-0.5">
                      {currentScan.securityScore}/100
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                    <div className="text-[11px] font-mono text-slate-400">WORKFLOW PROGRESS</div>
                    <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-0.5">
                      {currentScan.workflow.filter(s => s.status === 'completed').length} / {currentScan.workflow.length}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                    <div className="text-[11px] font-mono text-slate-400">FINDINGS DETECTED</div>
                    <div className="text-2xl font-extrabold font-mono text-orange-400 mt-0.5">
                      {currentScan.findings.length}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                    <div className="text-[11px] font-mono text-slate-400">AUTHORIZATION</div>
                    <div className="text-sm font-bold font-mono text-slate-200 mt-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{currentScan.authorizationId || 'AUTHORIZED'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subtabs: Workflow Graph, Live Terminal Log, Live Findings */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                <div className="border-b border-slate-800 px-6 py-3 flex items-center justify-between bg-slate-950/50">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setActiveStepTab('workflow')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition ${
                        activeStepTab === 'workflow'
                          ? 'bg-blue-600/20 text-cyan-400 border border-blue-500/40'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      WORKFLOW GRAPH ({currentScan.workflow.length} STAGES)
                    </button>
                    <button
                      onClick={() => setActiveStepTab('terminal')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition ${
                        activeStepTab === 'terminal'
                          ? 'bg-blue-600/20 text-cyan-400 border border-blue-500/40'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      LIVE TOOL TERMINAL
                    </button>
                    <button
                      onClick={() => setActiveStepTab('findings')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition ${
                        activeStepTab === 'findings'
                          ? 'bg-blue-600/20 text-cyan-400 border border-blue-500/40'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      FINDINGS FEED ({currentScan.findings.length})
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Tab 1: Interactive Workflow Stepper */}
                  {activeStepTab === 'workflow' && (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        {currentScan.workflow.map((step, idx) => (
                          <div
                            key={step.id || idx}
                            onClick={() => setSelectedStep(step)}
                            className={`p-4 rounded-xl border transition cursor-pointer ${
                              selectedStep?.id === step.id
                                ? 'bg-slate-850 border-blue-500/50 shadow-md'
                                : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5">{getStepStatusIcon(step.status)}</div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono text-slate-500">STAGE {idx + 1}</span>
                                    <span className="text-sm font-bold text-slate-200">{step.name}</span>
                                    <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded">
                                      {step.tool}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-400 mt-1">{step.description}</p>

                                  {step.outputSummary && (
                                    <div className="mt-2 text-xs font-mono text-cyan-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800/80">
                                      {step.outputSummary}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="text-right shrink-0 text-xs font-mono text-slate-500">
                                {step.durationMs ? `${step.durationMs}ms` : '—'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Live Tool Terminal Viewer */}
                  {activeStepTab === 'terminal' && (
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-1.5 max-h-[460px] overflow-y-auto scrollbar-thin">
                      <div className="text-slate-500 border-b border-slate-800/80 pb-2 mb-2 flex items-center justify-between">
                        <span>AEGIS LIVE LOG STREAM [STDIO / SSE]</span>
                        <span>TARGET: {currentScan.target}</span>
                      </div>
                      {currentScan.logs.map((line, lIdx) => (
                        <div
                          key={lIdx}
                          className={`leading-relaxed ${
                            line.includes('[ALERT]') || line.includes('[RISK') || line.includes('Critical')
                              ? 'text-rose-400 font-bold'
                              : line.includes('[WARN]')
                              ? 'text-amber-300'
                              : line.includes('[STAGE OK]') || line.includes('[COMPLETE]')
                              ? 'text-emerald-400 font-semibold'
                              : line.includes('[PORT OPEN]') || line.includes('[TECH]') || line.includes('[DNS]')
                              ? 'text-cyan-400'
                              : 'text-slate-300'
                          }`}
                        >
                          {line}
                        </div>
                      ))}
                      <div ref={terminalEndRef} />
                    </div>
                  )}

                  {/* Tab 3: Findings Feed */}
                  {activeStepTab === 'findings' && (
                    <div className="space-y-3">
                      {currentScan.findings.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-500 font-mono">
                          No findings discovered during this scan.
                        </div>
                      ) : (
                        currentScan.findings.map((finding) => (
                          <div
                            key={finding.id}
                            onClick={() => onSelectFinding(finding)}
                            className="p-4 bg-slate-950/70 hover:bg-slate-850 border border-slate-800 rounded-xl cursor-pointer transition space-y-2 group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded font-mono ${
                                  finding.severity === 'Critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : finding.severity === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                  : finding.severity === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                }`}>
                                  {finding.severity}
                                </span>
                                <span className="font-bold text-sm text-slate-200 group-hover:text-cyan-400 transition">
                                  {finding.title}
                                </span>
                              </div>
                              <span className="font-mono text-xs text-slate-400">CVSS {finding.cvss}</span>
                            </div>

                            <p className="text-xs text-slate-400 line-clamp-2">
                              {finding.description}
                            </p>

                            <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between pt-1">
                              <span>Asset: {finding.affectedAsset}</span>
                              <span className="text-cyan-400 group-hover:underline">View details & remediation →</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-4">
              <Activity className="w-12 h-12 text-slate-600 mx-auto" />
              <div>
                <h3 className="text-base font-bold text-slate-300">No Scan Selected</h3>
                <p className="text-xs text-slate-400 mt-1">Select a scan from the archive or launch a new security assessment.</p>
              </div>
              <button
                onClick={onLaunchNewScan}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition shadow-md"
              >
                + Launch New Scan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
