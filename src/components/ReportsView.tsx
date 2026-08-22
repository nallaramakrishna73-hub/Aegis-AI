import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingDown,
  AlertTriangle,
  FileCode
} from 'lucide-react';
import { VaptReport, ScanJob } from '../types';
import { generatePdfReport } from '../services/pdfReport';

interface ReportsViewProps {
  reports: VaptReport[];
  scans: ScanJob[];
  selectedReportId?: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  reports,
  scans,
  selectedReportId
}) => {
  const [currentReport, setCurrentReport] = useState<VaptReport | null>(null);

  useEffect(() => {
    if (selectedReportId) {
      const found = reports.find(r => r.id === selectedReportId || r.scanId === selectedReportId);
      if (found) {
        setCurrentReport(found);
        return;
      }
    }
    if (reports.length > 0 && !currentReport) {
      setCurrentReport(reports[0]);
    }
  }, [selectedReportId, reports]);

  const handleDownloadPdf = () => {
    if (!currentReport) return;
    generatePdfReport(currentReport);
  };

  const handleExportJson = () => {
    if (!currentReport) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentReport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `VAPT_Report_${currentReport.target}_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-slate-100">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left column: Available Reports Directory */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col h-[750px] shadow-lg">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
                REPORTS REPOSITORY ({reports.length})
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin">
            {reports.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 font-mono">
                No reports compiled yet. Run a scan to generate a VAPT report.
              </div>
            ) : (
              reports.map((rep) => (
                <div
                  key={rep.id}
                  onClick={() => setCurrentReport(rep)}
                  className={`p-3 rounded-xl cursor-pointer transition border text-xs ${
                    rep.id === currentReport?.id
                      ? 'bg-blue-600/20 border-blue-500/50 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold text-slate-200 truncate">{rep.target}</div>
                  <div className="text-[11px] font-mono text-cyan-400 mt-1">Score: {rep.securityScore}/100</div>
                  <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>{new Date(rep.generatedAt).toLocaleDateString()}</span>
                    <span>{rep.findings.length} findings</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 3 columns: Interactive Report Viewer */}
        <div className="lg:col-span-3 space-y-6">
          {currentReport ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-8">
              {/* Report Header & Action Bar */}
              <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-950 text-blue-400 border border-blue-800">
                    CONFIDENTIAL SECURITY ASSESSMENT
                  </span>
                  <h1 className="text-xl sm:text-2xl font-bold text-white mt-2">
                    {currentReport.title}
                  </h1>
                  <p className="text-xs font-mono text-slate-400 mt-1">
                    Document ID: {currentReport.id} | Generated: {new Date(currentReport.generatedAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportJson}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold transition"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>Export JSON</span>
                  </button>

                  <button
                    onClick={handleDownloadPdf}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF Report</span>
                  </button>
                </div>
              </div>

              {/* Executive Summary Box */}
              <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    EXECUTIVE ASSESSMENT SUMMARY
                  </h3>
                  <span className="text-sm font-mono font-bold text-cyan-400">
                    Security Score: {currentReport.securityScore} / 100
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-slate-200">
                  {currentReport.executiveSummary}
                </p>
              </div>

              {/* Scope & Methodology Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase text-slate-400">Scope of Assessment</h4>
                  <ul className="text-xs space-y-1.5 text-slate-300">
                    <li>Target Asset: <strong className="text-slate-100">{currentReport.scope.target}</strong></li>
                    <li>Scope Boundaries: <span className="font-mono text-cyan-400">{currentReport.scope.allowedScope.join(', ')}</span></li>
                    <li>Testing Timeline: <span className="text-slate-400">{currentReport.scope.testingPeriod}</span></li>
                  </ul>
                </div>

                <div className="p-5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase text-slate-400">Testing Methodology</h4>
                  <ul className="text-xs space-y-1 text-slate-300 list-disc list-inside">
                    {currentReport.methodology.map((m, idx) => (
                      <li key={idx} className="text-slate-400">{m}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Severity Metrics Bar */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  FINDINGS SEVERITY MATRIX
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-xl">
                    <span className="text-[10px] font-bold text-rose-400 font-mono">CRITICAL</span>
                    <div className="text-2xl font-mono font-extrabold text-rose-400 mt-1">{currentReport.summary.critical}</div>
                  </div>
                  <div className="p-3 bg-orange-950/30 border border-orange-500/30 rounded-xl">
                    <span className="text-[10px] font-bold text-orange-400 font-mono">HIGH</span>
                    <div className="text-2xl font-mono font-extrabold text-orange-400 mt-1">{currentReport.summary.high}</div>
                  </div>
                  <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl">
                    <span className="text-[10px] font-bold text-amber-400 font-mono">MEDIUM</span>
                    <div className="text-2xl font-mono font-extrabold text-amber-400 mt-1">{currentReport.summary.medium}</div>
                  </div>
                  <div className="p-3 bg-blue-950/30 border border-blue-500/30 rounded-xl">
                    <span className="text-[10px] font-bold text-blue-400 font-mono">LOW</span>
                    <div className="text-2xl font-mono font-extrabold text-blue-400 mt-1">{currentReport.summary.low}</div>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 font-mono">INFO</span>
                    <div className="text-2xl font-mono font-extrabold text-slate-400 mt-1">{currentReport.summary.info}</div>
                  </div>
                </div>
              </div>

              {/* Phased Remediation Roadmap */}
              <div className="space-y-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  PHASED REMEDIATION ROADMAP
                </h3>
                <div className="space-y-3">
                  {currentReport.remediationRoadmap.map((road, idx) => (
                    <div key={idx} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-cyan-400">{road.priority}</span>
                        <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded">
                          {road.timeline}
                        </span>
                      </div>
                      <ul className="text-xs space-y-1 text-slate-300 list-disc list-inside">
                        {road.actions.map((act, aIdx) => (
                          <li key={aIdx}>{act}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Retest Guidance */}
              <div className="p-5 bg-blue-950/20 border border-blue-500/30 rounded-xl space-y-2 text-xs text-blue-200">
                <h4 className="font-bold text-cyan-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Retest & Verification Guidance</span>
                </h4>
                <ul className="space-y-1 list-disc list-inside text-slate-300">
                  {currentReport.retestRecommendations.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-4">
              <FileSpreadsheet className="w-12 h-12 text-slate-600 mx-auto" />
              <div>
                <h3 className="text-base font-bold text-slate-300">No Report Selected</h3>
                <p className="text-xs text-slate-400 mt-1">Select a report from the list to view full executive findings and PDF download.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
