import React, { useState } from 'react';
import {
  Bug,
  Search,
  Filter,
  ShieldAlert,
  ArrowUpRight,
  Copy,
  Check,
  Code2,
  ExternalLink,
  Download,
  AlertTriangle,
  Layers,
  FileCheck2,
  CheckCircle2,
  X
} from 'lucide-react';
import { SecurityFinding } from '../types';

interface VulnerabilitiesViewProps {
  findings: SecurityFinding[];
  selectedFinding: SecurityFinding | null;
  onSelectFinding: (finding: SecurityFinding | null) => void;
}

export const VulnerabilitiesView: React.FC<VulnerabilitiesViewProps> = ({
  findings,
  selectedFinding,
  onSelectFinding
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeRemediationTab, setActiveRemediationTab] = useState<'nginx' | 'express' | 'apache' | 'python'>('nginx');

  const filteredFindings = findings.filter(f => {
    const matchesSearch =
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.affectedAsset.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.tool.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.cwe && f.cwe.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSeverity =
      severityFilter === 'all' || f.severity.toLowerCase() === severityFilter.toLowerCase();

    return matchesSearch && matchesSeverity;
  });

  const handleCopyCode = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const exportToJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredFindings, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Vulnerabilities_Export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportToCsv = () => {
    const headers = ['ID', 'Severity', 'CVSS', 'Title', 'Affected Asset', 'Tool', 'CWE', 'Remediation'];
    const rows = filteredFindings.map(f => [
      `"${f.id}"`,
      `"${f.severity}"`,
      `"${f.cvss}"`,
      `"${f.title.replace(/"/g, '""')}"`,
      `"${f.affectedAsset}"`,
      `"${f.tool}"`,
      `"${f.cwe || ''}"`,
      `"${f.remediation.replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `Vulnerabilities_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-slate-100">
      {/* Header & Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Bug className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">Vulnerability Management & Remediation</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Correlated security findings across active tools with CVSS v3.1 metrics and copyable fix code.
            </p>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={exportToCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-xl transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={exportToJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-xl transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Search & Severity Filters */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by vulnerability title, asset domain, tool, or CWE..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {['all', 'critical', 'high', 'medium', 'low', 'informational'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-2 rounded-xl text-xs font-mono font-semibold uppercase tracking-wider whitespace-nowrap transition ${
                  severityFilter === sev
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Findings Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono">
              <tr>
                <th className="py-3 px-4">SEVERITY</th>
                <th className="py-3 px-4">CVSS</th>
                <th className="py-3 px-4">VULNERABILITY TITLE</th>
                <th className="py-3 px-4">AFFECTED ASSET</th>
                <th className="py-3 px-4">TOOL</th>
                <th className="py-3 px-4">CWE</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredFindings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-mono">
                    No matching vulnerabilities found.
                  </td>
                </tr>
              ) : (
                filteredFindings.map((finding) => (
                  <tr
                    key={finding.id}
                    onClick={() => onSelectFinding(finding)}
                    className="hover:bg-slate-850/80 cursor-pointer transition"
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded font-mono ${
                        finding.severity === 'Critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : finding.severity === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        : finding.severity === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {finding.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                      {finding.cvss}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200 max-w-xs truncate">
                      {finding.title}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono max-w-[200px] truncate">
                      {finding.affectedAsset}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      <span className="px-1.5 py-0.5 bg-slate-950 rounded border border-slate-800 text-[11px] font-mono">
                        {finding.tool}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-cyan-400 font-mono">
                      {finding.cwe || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectFinding(finding);
                        }}
                        className="p-1.5 text-slate-400 hover:text-cyan-400 rounded transition"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vulnerability Detail Drawer / Modal */}
      {selectedFinding && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-950/60 sticky top-0 backdrop-blur">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 text-xs font-bold rounded font-mono ${
                    selectedFinding.severity === 'Critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : selectedFinding.severity === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : selectedFinding.severity === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {selectedFinding.severity}
                  </span>
                  <span className="font-mono text-xs text-slate-400">CVSS v3.1 Score: <strong>{selectedFinding.cvss}</strong></span>
                  {selectedFinding.cwe && (
                    <span className="font-mono text-xs text-cyan-400">[{selectedFinding.cwe}]</span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-white mt-1">{selectedFinding.title}</h2>
                <p className="text-xs font-mono text-slate-400">Affected Asset: {selectedFinding.affectedAsset}</p>
              </div>

              <button
                onClick={() => onSelectFinding(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 text-xs text-slate-300">
              {/* CVSS & Tool Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500">SEVERITY LEVEL</span>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">{selectedFinding.severity}</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500">DETECTION TOOL</span>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">{selectedFinding.tool}</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500">CONFIDENCE</span>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">{selectedFinding.confidence || 'Confirmed'}</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500">CVSS VECTOR</span>
                  <div className="text-xs font-mono text-slate-300 mt-0.5 truncate">{selectedFinding.cvssVector || 'CVSS:3.1/AV:N/AC:L'}</div>
                </div>
              </div>

              {/* Technical Description */}
              <div className="space-y-2">
                <h4 className="font-mono font-semibold uppercase text-slate-400 tracking-wider">
                  Technical Vulnerability Description
                </h4>
                <p className="leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-slate-200">
                  {selectedFinding.description}
                </p>
              </div>

              {/* Technical Evidence */}
              {selectedFinding.evidence && (
                <div className="space-y-2">
                  <h4 className="font-mono font-semibold uppercase text-slate-400 tracking-wider">
                    Observed Evidence / HTTP Proof of Concept
                  </h4>
                  <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-cyan-300 text-[11px] overflow-x-auto whitespace-pre-wrap">
                    {selectedFinding.evidence}
                  </pre>
                </div>
              )}

              {/* Impact Analysis */}
              {selectedFinding.impact && (
                <div className="space-y-2">
                  <h4 className="font-mono font-semibold uppercase text-slate-400 tracking-wider">
                    Security Impact & Business Risk
                  </h4>
                  <p className="leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-slate-200">
                    {selectedFinding.impact}
                  </p>
                </div>
              )}

              {/* Remediation Guidelines & Code Examples */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-mono font-semibold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-cyan-400" />
                    <span>Remediation Guidance & Configuration Snippets</span>
                  </h4>
                </div>

                <div className="p-4 bg-blue-950/20 border border-blue-500/30 rounded-xl text-blue-200 leading-relaxed">
                  {selectedFinding.remediation}
                </div>

                {/* Multi-language Code Tabs */}
                {selectedFinding.codeSnippets && (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden mt-3">
                    <div className="border-b border-slate-800 px-4 py-2 flex items-center justify-between bg-slate-900/60">
                      <div className="flex space-x-2">
                        {Object.keys(selectedFinding.codeSnippets).map((lang) => (
                          <button
                            key={lang}
                            onClick={() => setActiveRemediationTab(lang as any)}
                            className={`px-2.5 py-1 text-xs font-mono rounded-lg transition ${
                              activeRemediationTab === lang
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {lang.toUpperCase()}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => handleCopyCode((selectedFinding.codeSnippets as any)[activeRemediationTab] || '', activeRemediationTab)}
                        className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-xs font-mono"
                      >
                        {copiedKey === activeRemediationTab ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy Code</span>
                      </button>
                    </div>

                    <pre className="p-4 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                      {(selectedFinding.codeSnippets as any)[activeRemediationTab] || '// No specific snippet available for this platform'}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between sticky bottom-0">
              <span className="font-mono text-[11px] text-slate-500">ID: {selectedFinding.id}</span>
              <button
                onClick={() => onSelectFinding(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
