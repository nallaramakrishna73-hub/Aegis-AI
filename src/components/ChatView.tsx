import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  Activity,
  Plus,
  Trash2,
  Copy,
  Check,
  KeyRound,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Cpu,
  Layers,
  FileText
} from 'lucide-react';
import {
  ChatMessage,
  ConversationThread,
  IntentClassification,
  SecurityFinding
} from '../types';
import { api } from '../services/api';

interface ChatViewProps {
  conversations: ConversationThread[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onNavigateToScan: (scanId: string) => void;
  onNavigateToFindings: () => void;
  onOpenAuthorizationForTarget: (target: string) => void;
  selectedTarget: string;
}

const PROMPT_SUGGESTIONS = [
  {
    title: 'Web Vulnerability Assessment',
    prompt: 'Scan my website testphp.vulnweb.com for security vulnerabilities and give me a full VAPT assessment.'
  },
  {
    title: 'Port & Service Enumeration',
    prompt: 'Check 44.228.249.3 for open ports and identify running services.'
  },
  {
    title: 'SSL/TLS Cryptographic Audit',
    prompt: 'Check the SSL/TLS configuration and certificate expiry for testphp.vulnweb.com.'
  },
  {
    title: 'SQL Injection Assessment',
    prompt: 'Find possible SQL injection vulnerabilities and explain remediation steps.'
  },
  {
    title: 'API Security Audit',
    prompt: 'Perform an API security assessment on testphp.vulnweb.com/api/v1.'
  },
  {
    title: 'Generate VAPT Report',
    prompt: 'Generate an executive VAPT security report summarizing all detected issues.'
  }
];

export const ChatView: React.FC<ChatViewProps> = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onNavigateToScan,
  onNavigateToFindings,
  onOpenAuthorizationForTarget,
  selectedTarget
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync messages with current conversation
  useEffect(() => {
    if (currentConversationId) {
      const conv = conversations.find(c => c.id === currentConversationId);
      if (conv) {
        setMessages(conv.messages);
      }
    } else {
      setMessages([]);
    }
  }, [currentConversationId, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    setInputMessage('');
    setIsLoading(true);

    const tempUserMsg: ChatMessage = {
      id: `msg-u-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const response = await api.sendChatMessage({
        message: textToSend,
        conversationId: currentConversationId || undefined,
        targetContext: selectedTarget || undefined
      });

      if (!currentConversationId && response.conversationId) {
        onSelectConversation(response.conversationId);
      }

      setMessages(prev => [...prev, response.message]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: `**Assessment Engine Warning:** ${err.message || 'An error occurred while connecting to the VAPT orchestrator.'}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const currentConv = conversations.find(c => c.id === currentConversationId);

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden bg-slate-950 text-slate-100">
      {/* Left Sidebar: Conversation Threads */}
      <aside className="w-72 bg-slate-900/90 border-r border-slate-800 flex flex-col hidden md:flex">
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
            Assessment Threads
          </span>
          <button
            id="btn-new-thread"
            onClick={onNewConversation}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No previous threads.
            </div>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer text-xs transition ${
                  conv.id === currentConversationId
                    ? 'bg-blue-600/20 text-white border border-blue-500/40 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Terminal className={`w-3.5 h-3.5 shrink-0 ${conv.id === currentConversationId ? 'text-blue-400' : 'text-slate-500'}`} />
                  <span className="truncate font-medium">{conv.title}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 rounded transition"
                  title="Delete thread"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Target Scope Pill */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-mono text-[11px]">ACTIVE TARGET:</span>
            <span className="px-1.5 py-0.5 text-[10px] bg-cyan-950 text-cyan-400 rounded border border-cyan-800/40">
              {selectedTarget || 'testphp.vulnweb.com'}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Chat Stream */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950">
        {/* Chat Messages Scroll Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center max-w-3xl mx-auto text-center space-y-6 py-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-indigo-500/10 border border-blue-500/30 flex items-center justify-center shadow-xl shadow-blue-500/10">
                <Sparkles className="w-8 h-8 text-cyan-400" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Aegis-AI Security Copilot
                </h2>
                <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                  Autonomous intent understanding, authorized scanning orchestration, and real-time vulnerability remediation.
                </p>
              </div>

              {/* Sample Prompt Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl text-left">
                {PROMPT_SUGGESTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(item.prompt)}
                    className="group p-3.5 bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl transition shadow-sm hover:shadow-md text-left"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-400 transition">
                        {item.title}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 transition" />
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">
                      {item.prompt}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={msg.id || index}
                className={`flex gap-3 max-w-4xl mx-auto ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-blue-500/40 flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-blue-500/10">
                    <ShieldAlert className="w-4 h-4 text-cyan-400" />
                  </div>
                )}

                <div
                  className={`relative group rounded-2xl px-4.5 py-3.5 text-sm leading-relaxed max-w-[88%] sm:max-w-[80%] ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-600/20'
                      : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  {/* Intent classification badge if available */}
                  {msg.intent && msg.role === 'assistant' && (
                    <div className="flex flex-wrap items-center gap-1.5 mb-2.5 pb-2 border-b border-slate-800/80 text-[11px] font-mono">
                      <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-800/40 flex items-center gap-1">
                        <Cpu className="w-3 h-3" />
                        <span>INTENT: {msg.intent.intent.toUpperCase()}</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded border ${
                        msg.intent.riskLevel === 'high' || msg.intent.riskLevel === 'critical'
                          ? 'bg-rose-950/60 text-rose-300 border-rose-800/40'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        RISK: {msg.intent.riskLevel.toUpperCase()}
                      </span>
                      {msg.intent.target && (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          TARGET: {msg.intent.target}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="space-y-3 whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </div>

                  {/* Authorization Required Warning Card */}
                  {msg.authorizationRequest && (
                    <div className="mt-4 p-3.5 bg-amber-950/30 border border-amber-500/40 rounded-xl text-xs space-y-2.5">
                      <div className="flex items-center gap-2 text-amber-400 font-semibold">
                        <KeyRound className="w-4 h-4" />
                        <span>Authorization Confirmation Required</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        To execute active penetration testing against <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded">{msg.authorizationRequest.target}</code>, you must acknowledge testing authorization.
                      </p>
                      <button
                        onClick={() => onOpenAuthorizationForTarget(msg.authorizationRequest!.target)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-lg transition shadow-md shadow-amber-500/20 active:scale-95"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Confirm & Authorize Target</span>
                      </button>
                    </div>
                  )}

                  {/* Scan Launched / Connected Card */}
                  {msg.scanId && (
                    <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200">Scan Job Active</div>
                          <div className="font-mono text-[10px] text-slate-400">{msg.scanId}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => onNavigateToScan(msg.scanId!)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-lg transition font-medium"
                      >
                        <span>View Live Workflow</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Findings Quick Preview */}
                  {msg.findingsPreview && msg.findingsPreview.length > 0 && (
                    <div className="mt-4 space-y-2 border-t border-slate-800 pt-3">
                      <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                        <span>Discovered Findings ({msg.findingsPreview.length}):</span>
                        <button
                          onClick={onNavigateToFindings}
                          className="text-cyan-400 hover:underline text-[11px]"
                        >
                          View all in Vulnerabilities tab →
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {msg.findingsPreview.slice(0, 3).map((f) => (
                          <div
                            key={f.id}
                            className="p-2 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded ${
                                f.severity === 'Critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : f.severity === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                : f.severity === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              }`}>
                                {f.severity}
                              </span>
                              <span className="text-slate-200 truncate">{f.title}</span>
                            </div>
                            <span className="font-mono text-slate-400 text-[11px] ml-2 shrink-0">
                              CVSS {f.cvss}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Copy button */}
                  <button
                    onClick={() => handleCopy(msg.content, msg.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white rounded transition"
                    title="Copy message"
                  >
                    {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex gap-3 max-w-4xl mx-auto justify-start">
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-blue-500/40 flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce delay-100"></span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce delay-200"></span>
                <span className="text-xs font-mono text-slate-400 ml-1">Analyzing security intent & orchestrating tools...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 backdrop-blur">
          <div className="max-w-4xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative flex items-center"
            >
              <input
                id="chat-input-field"
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask Aegis (e.g. 'Scan testphp.vulnweb.com for vulnerabilities', 'Check open ports on 44.228.249.3')..."
                className="w-full bg-slate-900/90 text-slate-100 placeholder-slate-500 text-sm rounded-xl pl-4 pr-12 py-3.5 border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition shadow-inner"
              />
              <button
                type="submit"
                id="btn-chat-submit"
                disabled={!inputMessage.trim() || isLoading}
                className="absolute right-2.5 p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition transform active:scale-95 shadow-md"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mt-2 px-1">
              <span>Security Copilot Engine · Zero intrusive attacks on unauthorized targets</span>
              <span>Gemini 3.7 Flash</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
