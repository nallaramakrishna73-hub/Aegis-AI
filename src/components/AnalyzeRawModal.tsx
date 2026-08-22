import React, { useState } from 'react';
import {
  FileCode,
  Sparkles,
  RefreshCw,
  X,
  CheckCircle2,
  Bug,
  Code2
} from 'lucide-react';
import { api } from '../services/api';
import { SecurityFinding } from '../types';

interface AnalyzeRawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete: (scanId: string) => void;
}

const SAMPLE_NMAP = `Starting Nmap 7.94 ( https://nmap.org ) at 2026-08-22 09:14 UTC
Nmap scan report for testphp.vulnweb.com (44.228.249.3)
Host is up (0.012s latency).
Not shown: 994 closed tcp ports (reset)
PORT     STATE SERVICE VERSION
21/tcp   open  ftp     vsftpd 2.3.4 (Anonymous FTP login allowed)
22/tcp   open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.8 (Ubuntu Linux; protocol 2.0)
80/tcp   open  http    nginx 1.14.0 (Ubuntu)
|_http-server-header: nginx/1.14.0 (Ubuntu)
|_http-title: Home of PHP Vulnerable Test Web Site
443/tcp  open  ssl/http nginx 1.14.0 (Ubuntu)
|_ssl-enum-ciphers: TLSv1.0 (Weak cipher TLS_RSA_WITH_AES_128_CBC_SHA)
3306/tcp open  mysql   MySQL 5.5.62-0ubuntu0.14.04.1
| mysql-info: 
|_  Server version: 5.5.62 (Unauthenticated connection handshake response)
8080/tcp open  http    Apache Tomcat 8.5.5`;

const SAMPLE_HTTP_RESPONSE = `HTTP/1.1 200 OK
Server: Apache/2.4.41 (Ubuntu)
Set-Cookie: session_token=abcd1234efgh5678; Path=/
Content-Type: text/html; charset=UTF-8
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
X-Powered-By: PHP/7.4.3
Connection: keep-alive

<!-- Debug: Database connection string: mysql://root:toor123@localhost/app_db -->
<!DOCTYPE html>
<html>
<head><title>Admin Portal</title></head>
<body><h1>Welcome Admin</h1></body>
</html>`;

export const AnalyzeRawModal: React.FC<AnalyzeRawModalProps> = ({
  isOpen,
  onClose,
  onAnalysisComplete
}) => {
  const [rawText, setRawText] = useState(SAMPLE_NMAP);
  const [toolHint, setToolHint] = useState('Nmap Output');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    summary: string;
    securityScore: number;
    findings: SecurityFinding[];
    scanId: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (!rawText.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const res = await api.analyzeRawOutput({
        rawLog: rawText,
        toolHint
      });
      setResult(res);
    } catch (err: any) {
      alert(err.message || 'Failed to analyze raw log');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 text-slate-100 flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">AI Raw Output & Log Analyzer</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Phase */}
        {!result ? (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-semibold">
                Paste Raw Terminal Output, HTTP Response, or Tool Logs
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRawText(SAMPLE_NMAP);
                    setToolHint('Nmap Output');
                  }}
                  className="text-cyan-400 hover:underline"
                >
                  Load Sample Nmap
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => {
                    setRawText(SAMPLE_HTTP_RESPONSE);
                    setToolHint('HTTP Response');
                  }}
                  className="text-cyan-400 hover:underline"
                >
                  Load Sample HTTP
                </button>
              </div>
            </div>

            <textarea
              rows={12}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste raw output from Nmap, ZAP, Nuclei, Nikto, SSL labs, or HTTP headers..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 font-mono text-[11px] placeholder-slate-500 focus:outline-none focus:border-blue-500 scrollbar-thin"
            />

            <div className="pt-2 flex items-center justify-between">
              <span className="text-slate-400 text-[11px] font-mono">
                {rawText.split('\n').length} lines · Gemini Security Correlator
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={!rawText.trim() || isAnalyzing}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-40 text-white rounded-xl font-bold shadow-md transition"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Analyzing Findings...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Parse & Correlate with AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Result View */
          <div className="space-y-5 text-xs">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-400 font-mono">AI LOG CORRELATION SUMMARY</span>
                <span className="font-mono text-white font-bold">Score: {result.securityScore}/100</span>
              </div>
              <p className="text-slate-300 leading-relaxed">{result.summary}</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-mono font-bold text-slate-400 uppercase">
                Extracted Findings ({result.findings.length})
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
                {result.findings.map((f, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded font-mono ${
                          f.severity === 'Critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : f.severity === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {f.severity}
                        </span>
                        <span className="font-bold text-slate-200">{f.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{f.description}</p>
                    </div>
                    <span className="font-mono text-slate-400 text-xs shrink-0">CVSS {f.cvss}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setResult(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition"
              >
                Analyze Another Output
              </button>

              <button
                type="button"
                onClick={() => {
                  onAnalysisComplete(result.scanId);
                  onClose();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-md transition"
              >
                View Full Scan Record →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
