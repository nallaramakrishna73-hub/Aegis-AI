import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  X,
  Lock,
  Globe,
  FileCheck
} from 'lucide-react';
import { TargetType } from '../types';

interface AuthorizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: string;
  onConfirm: (params: {
    target: string;
    targetType: TargetType;
    allowedScope: string[];
    testType: string;
    confirmedBy: string;
    statement: string;
  }) => Promise<void>;
}

export const AuthorizationModal: React.FC<AuthorizationModalProps> = ({
  isOpen,
  onClose,
  target,
  onConfirm
}) => {
  const [currentTarget, setCurrentTarget] = useState(target);
  const [targetType, setTargetType] = useState<TargetType>('domain');
  const [operatorName, setOperatorName] = useState('Authorized Operator');
  const [scopeInput, setScopeInput] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setCurrentTarget(target);
    setScopeInput(target ? `${target}, *.${target}` : '');
  }, [target]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTarget.trim() || !agreed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const scopeArray = scopeInput.trim()
        ? scopeInput.split(',').map(s => s.trim())
        : [currentTarget.trim(), `*.${currentTarget.trim()}`];

      await onConfirm({
        target: currentTarget.trim(),
        targetType,
        allowedScope: scopeArray,
        testType: 'full_vapt',
        confirmedBy: operatorName,
        statement: 'I confirm that I have permission to perform security testing against this target.'
      });

      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to authorize target');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-5 text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-amber-400">
            <KeyRound className="w-5 h-5" />
            <h3 className="text-lg font-bold text-white">Target Scope Authorization</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Target Hostname or IP *
            </label>
            <input
              type="text"
              required
              value={currentTarget}
              onChange={(e) => setCurrentTarget(e.target.value)}
              placeholder="e.g. testphp.vulnweb.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Target Type</label>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as TargetType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500 text-xs"
              >
                <option value="domain">Domain / Host</option>
                <option value="ip">IPv4 Address</option>
                <option value="url">URL Endpoint</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Authorized Operator</label>
              <input
                type="text"
                required
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500 text-xs"
              >
              </input>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Allowed Subdomains & Scope
            </label>
            <input
              type="text"
              value={scopeInput}
              onChange={(e) => setScopeInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500 text-xs font-mono"
            />
          </div>

          {/* Legal Compliance Check */}
          <div className="p-3.5 bg-amber-950/30 border border-amber-500/40 rounded-xl space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-slate-200 leading-relaxed font-medium">
                I hereby certify and confirm that I have proper authorization and legal permissions to conduct security scans against <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded">{currentTarget || 'this target'}</code>.
              </span>
            </label>
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
              disabled={!agreed || !currentTarget.trim() || isSubmitting}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-bold rounded-xl shadow-md transition"
            >
              {isSubmitting ? 'Granting...' : 'Confirm & Authorize'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
