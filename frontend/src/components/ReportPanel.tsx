import React from 'react';

interface ReportPanelProps {
  onGenerate: (format: 'pdf' | 'docx') => void;
  generating: boolean;
}

export function ReportPanel({ onGenerate, generating }: ReportPanelProps) {
  return (
    <div className="card-glow p-6">
      <h3 className="text-lg font-semibold text-slate-100 mb-4">Download Security Report</h3>
      <p className="text-slate-400 text-sm mb-4">
        Generate a polished incident report with AI summaries, risk levels, and recommended actions.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onGenerate('pdf')}
          disabled={generating}
          className="btn-primary w-full"
        >
          {generating ? 'Generating...' : 'Download PDF'}
        </button>
        <button
          onClick={() => onGenerate('docx')}
          disabled={generating}
          className="btn-secondary w-full"
        >
          {generating ? 'Generating...' : 'Download DOCX'}
        </button>
      </div>
    </div>
  );
}
