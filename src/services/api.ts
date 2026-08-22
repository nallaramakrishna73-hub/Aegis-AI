import {
  ScanJob,
  SecurityFinding,
  AuthorizationRecord,
  ConversationThread,
  SecurityTool,
  VaptReport,
  ChatMessage,
  IntentClassification
} from '../types';

export const api = {
  // Chat
  async sendChatMessage(params: {
    message: string;
    conversationId?: string;
    targetContext?: string;
  }): Promise<{
    conversationId: string;
    message: ChatMessage;
    intent: IntentClassification;
    scanId?: string;
    isAuthorized: boolean;
  }> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to send message' }));
      throw new Error(err.error || 'Failed to send message');
    }
    return res.json();
  },

  // Scans
  async getScans(): Promise<ScanJob[]> {
    const res = await fetch('/api/scans');
    return res.json();
  },

  async getScan(id: string): Promise<ScanJob> {
    const res = await fetch(`/api/scans/${id}`);
    if (!res.ok) throw new Error('Scan not found');
    return res.json();
  },

  async createScan(params: {
    target: string;
    targetType?: string;
    scanType?: string;
    authorizationId?: string;
  }): Promise<ScanJob> {
    const res = await fetch('/api/scans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create scan' }));
      throw new Error(err.error || 'Failed to create scan');
    }
    return res.json();
  },

  async cancelScan(id: string): Promise<void> {
    const res = await fetch(`/api/scans/${id}/cancel`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to cancel scan');
  },

  // Vulnerabilities
  async getVulnerabilities(): Promise<SecurityFinding[]> {
    const res = await fetch('/api/vulnerabilities');
    return res.json();
  },

  // Authorizations
  async getAuthorizations(): Promise<AuthorizationRecord[]> {
    const res = await fetch('/api/authorization');
    return res.json();
  },

  async createAuthorization(params: {
    target: string;
    targetType?: string;
    allowedScope?: string[];
    testType?: string;
    confirmedBy?: string;
    statement?: string;
  }): Promise<AuthorizationRecord> {
    const res = await fetch('/api/authorization', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Failed to create authorization');
    return res.json();
  },

  async revokeAuthorization(id: string): Promise<void> {
    const res = await fetch(`/api/authorization/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to revoke authorization');
  },

  // Reports
  async getReports(): Promise<VaptReport[]> {
    const res = await fetch('/api/reports');
    return res.json();
  },

  async getReport(id: string): Promise<VaptReport> {
    const res = await fetch(`/api/reports/${id}`);
    if (!res.ok) throw new Error('Report not found');
    return res.json();
  },

  // History / Conversations
  async getConversations(): Promise<ConversationThread[]> {
    const res = await fetch('/api/history');
    return res.json();
  },

  async createConversation(title?: string): Promise<ConversationThread> {
    const res = await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });
    return res.json();
  },

  async deleteConversation(id: string): Promise<void> {
    await fetch(`/api/history/${id}`, { method: 'DELETE' });
  },

  // Raw Analysis
  async analyzeRawOutput(params: {
    rawLog: string;
    toolHint?: string;
  }): Promise<{
    summary: string;
    securityScore: number;
    findings: SecurityFinding[];
    scanId: string;
  }> {
    const res = await fetch('/api/analyze-raw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Failed to analyze raw output');
    return res.json();
  },

  // Tools
  async getTools(): Promise<SecurityTool[]> {
    const res = await fetch('/api/tools');
    return res.json();
  }
};
