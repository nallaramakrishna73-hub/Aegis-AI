import React, { useState } from 'react';
import {
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Plus,
  Trash2,
  Lock,
  Globe,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Clock
} from 'lucide-react';
import { AuthorizationRecord, TargetType } from '../types';

interface AuthorizationsViewProps {
  authorizations: AuthorizationRecord[];
  onAddAuthorization: (params: {
    target: string;
    targetType: TargetType;
    allowedScope: string[];
    testType: string;
    confirmedBy: string;
    statement: string;
  }) => Promise<void>;
  onRevokeAuthorization: (id: string) => Promise<void>;
}

export const AuthorizationsView: React.FC<AuthorizationsViewProps> = ({
  authorizations,
  onAddAuthorization,
  onRevokeAuthorization
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [targetInput, setTargetInput] = useState('');
  const [targetType, setTargetType] = useState<TargetType>('domain');
  const [scopeInput, setScopeInput] = useState('');
  const [testType, setTestType] = useState('full_vapt');
  const [operatorName, setOperatorName] = useState('Authorized Security Lead');
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetInput.trim() || !agreementChecked || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const scopeArray = scopeInput.trim()
        ? scopeInput.split(',').map(s => s.trim())
        : [targetInput.trim(), `*.${targetInput.trim()}`];

      await onAddAuthorization({
        target: targetInput.trim(),
        targetType,
        allowedScope: scopeArray,
        testType,
        confirmedBy: operatorName,
        statement: 'I confirm that I have written permission from the system owner to perform penetration testing.'
      });

      setShowAddModal(false);
      setTargetInput('');
      setScopeInput('');
      setAgreementChecked(false);
    } catch (err: any) {
      alert(err.message || 'Failed to grant authorization');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-slate-100">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Target Scope & Authorization Registry</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Mandatory ethical compliance engine. Active vulnerability assessment tools will only run against verified targets.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Grant Target Authorization</span>
        </button>
      </div>

      {/* Authorizations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {authorizations.map((auth) => (
          <div
            key={auth.id}
            className={`bg-slate-900/90 border rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 ${
              auth.status === 'active'
                ? 'border-emerald-500/30'
                : 'border-rose-500/30 opacity-75'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-slate-400">{auth.id}</span>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded font-mono ${
                  auth.status === 'active'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}>
                  {auth.status.toUpperCase()}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>TARGET ASSET:</span>
                </div>
                <div className="text-base font-bold text-white mt-0.5 break-all">
                  {auth.target}
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="text-slate-400">
                  Allowed Scope:
                  <div className="font-mono text-[11px] text-cyan-300 bg-slate-950 px-2 py-1 rounded border border-slate-800 mt-1">
                    {auth.allowedScope.join(', ')}
                  </div>
                </div>

                <div className="flex items-center justify-between text-slate-400 pt-1">
                  <span>Scope Type: <strong className="text-slate-200">{auth.targetType.toUpperCase()}</strong></span>
                  <span>Test Scope: <strong className="text-slate-200">{auth.testType.replace('_', ' ').toUpperCase()}</strong></span>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-1 font-mono">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Confirmed by {auth.confirmedBy}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500">
                Expires: {new Date(auth.expiresAt).toLocaleDateString()}
              </span>

              {auth.status === 'active' && (
                <button
                  onClick={() => onRevokeAuthorization(auth.id)}
                  className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-medium transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Revoke</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Authorization Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Authorize Target for Assessment</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Target Domain, IP, or URL *
                </label>
                <input
                  type="text"
                  required
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  placeholder="e.g. testphp.vulnweb.com or 44.228.249.3"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Type</label>
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value as TargetType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 text-xs"
                  >
                    <option value="domain">Domain / Hostname</option>
                    <option value="ip">IPv4 / IPv6 Address</option>
                    <option value="cidr">CIDR IP Range</option>
                    <option value="url">Specific Web URL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Permitted Test Depth</label>
                  <select
                    value={testType}
                    onChange={(e) => setTestType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 text-xs"
                  >
                    <option value="full_vapt">Comprehensive Full VAPT</option>
                    <option value="web_vapt">Web App & Header Audit</option>
                    <option value="network_ports">Port & Network Scan</option>
                    <option value="ssl_audit">SSL/TLS Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Allowed Scope Subdomains / Paths (Comma separated)
                </label>
                <input
                  type="text"
                  value={scopeInput}
                  onChange={(e) => setScopeInput(e.target.value)}
                  placeholder="e.g. *.vulnweb.com, testphp.vulnweb.com/api/*"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Authorized Operator Name</label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              {/* Legal Confirmation Checkbox */}
              <div className="p-3.5 bg-amber-950/20 border border-amber-500/40 rounded-xl space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={agreementChecked}
                    onChange={(e) => setAgreementChecked(e.target.checked)}
                    className="mt-0.5 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-300 leading-relaxed">
                    I confirm that I own or have written permission from the system owner to perform penetration testing and vulnerability assessments against this target.
                  </span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!agreementChecked || !targetInput.trim() || isSubmitting}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white rounded-xl font-bold shadow-md transition"
                >
                  {isSubmitting ? 'Granting...' : 'Confirm Authorization'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
