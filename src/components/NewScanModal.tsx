import React, { useState } from 'react';
import {
  Play,
  Activity,
  Globe,
  Shield,
  Layers,
  X,
  Zap,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { ScanJob, AuthorizationRecord, TargetType } from '../types';

interface NewScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunch: (params: {
    target: string;
    targetType: string;
    scanType: string;
    authorizationId?: string;
  }) => Promise<void>;
  authorizations: AuthorizationRecord[];
  defaultTarget?: string;
  defaultScanType?: ScanJob['scanType'];
  onOpenAuthorizationForTarget: (target: string) => void;
}

export const NewScanModal: React.FC<NewScanModalProps> = ({
  isOpen,
  onClose,
  onLaunch,
  authorizations,
  defaultTarget = 'testphp.vulnweb.com',
  defaultScanType = 'web_vapt',
  onOpenAuthorizationForTarget
}) => {
  const [target, setTarget] = useState(defaultTarget);
  const [targetType, setTargetType] = useState<TargetType>('domain');
  const [scanType, setScanType] = useState<ScanJob['scanType']>(defaultScanType);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const cleanTarget = target.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const activeAuth = authorizations.find(
    a => a.status === 'active' && (a.target.toLowerCase() === cleanTarget.toLowerCase() || cleanTarget.toLowerCase().endsWith(a.target.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target.trim() || isSubmitting) return;

    if (!activeAuth) {
      onOpenAuthorizationForTarget(cleanTarget);
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      await onLaunch({
        target: cleanTarget,
        targetType,
        scanType,
        authorizationId: activeAuth.id
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to start scan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-5 text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Launch Security Assessment</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
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
              value={target}
              onChange={(e) => setTarget(e.target.value)}
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
                <option value="ip">IPv4 Address</option>
                <option value="url">Web URL</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Assessment Profile</label>
              <select
                value={scanType}
                onChange={(e) => setScanType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 text-xs"
              >
                <option value="web_vapt">Full Web VAPT</option>
                <option value="network_ports">Port & Service Scan</option>
                <option value="ssl_audit">SSL/TLS Cryptographic Audit</option>
                <option value="api_security">API Security Probing</option>
                <option value="quick_recon">Passive Reconnaissance</option>
              </select>
            </div>
          </div>

          {/* Authorization Check Status */}
          <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
            activeAuth
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
              : 'bg-amber-950/20 border-amber-500/40 text-amber-300'
          }`}>
            {activeAuth ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Target Scope Authorized</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Authorization pass <code className="text-emerald-400">{activeAuth.id}</code> is active.
                  </div>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Authorization Confirmation Needed</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Clicking Launch will prompt for authorization agreement.
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!target.trim() || isSubmitting}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-40 text-white rounded-xl font-bold shadow-md transition"
            >
              {isSubmitting ? 'Starting...' : activeAuth ? 'Start Automated Scan' : 'Confirm Scope & Launch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
