import React from 'react';
import {
  Wrench,
  Shield,
  Terminal,
  Cpu,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';
import { SecurityTool } from '../types';

interface ToolsCatalogViewProps {
  tools: SecurityTool[];
}

export const ToolsCatalogView: React.FC<ToolsCatalogViewProps> = ({ tools }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-slate-100">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">Allowlisted Security Tools Registry</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Strict command execution registry and parameter sanitization sandbox. Direct raw shell commands from untrusted inputs are blocked by design.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-blue-950 text-cyan-400 rounded border border-blue-800">
                  {tool.category.toUpperCase()}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ACTIVE</span>
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{tool.name}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tool.description}</p>
              </div>

              {/* Supported Targets */}
              <div className="space-y-1.5 text-xs">
                <span className="text-[11px] font-mono text-slate-500">SUPPORTED TARGETS:</span>
                <div className="flex flex-wrap gap-1">
                  {tool.supportedTargets.map((t) => (
                    <span key={t} className="px-2 py-0.5 text-[10px] font-mono bg-slate-950 text-slate-300 rounded border border-slate-800">
                      {t.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Command Template */}
              <div className="space-y-1 text-xs">
                <span className="text-[11px] font-mono text-slate-500">SAFE EXECUTION TEMPLATE:</span>
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-cyan-300 truncate">
                  {tool.commandTemplate}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>SANDBOX: ISOLATED</span>
              <span>ALLOWLISTED: YES</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
