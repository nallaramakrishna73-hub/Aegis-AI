export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';

export type TargetType = 'domain' | 'subdomain' | 'ip' | 'cidr' | 'url' | 'api_endpoint';

export type ScanStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export interface AuthorizationRecord {
  id: string;
  target: string;
  targetType: TargetType;
  allowedScope: string[];
  testType: 'passive' | 'active_safe' | 'full_vapt';
  confirmedBy: string;
  confirmedAt: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'revoked';
  statement: string;
}

export interface SecurityFinding {
  id: string;
  title: string;
  severity: SeverityLevel;
  cvss: number;
  cvssVector?: string;
  confidence: number; // 0 to 1
  affectedAsset: string;
  description: string;
  evidence: string;
  impact: string;
  remediation: string;
  remediationCode?: {
    language: string;
    snippet: string;
    filename?: string;
  }[];
  references: string[];
  tool: string;
  cwe?: string;
  cve?: string;
  timestamp: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  tool: string;
  status: StepStatus;
  startTime?: string;
  endTime?: string;
  durationMs?: number;
  input?: Record<string, any>;
  outputSummary?: string;
  findingsCount?: number;
  rawLogs?: string[];
  error?: string;
}

export interface ScanJob {
  id: string;
  target: string;
  targetType: TargetType;
  title: string;
  scanType: 'quick_recon' | 'web_vapt' | 'network_ports' | 'ssl_audit' | 'api_security' | 'full_vapt' | 'raw_analysis';
  status: ScanStatus;
  startTime: string;
  endTime?: string;
  securityScore: number; // 0 - 100
  workflow: WorkflowStep[];
  findings: SecurityFinding[];
  logs: string[];
  authorized: boolean;
  authorizationId?: string;
  summary?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    total: number;
  };
  metadata?: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  intent?: IntentClassification;
  scanId?: string;
  authorizationRequest?: {
    target: string;
    targetType: TargetType;
    scope: string;
    suggestedWorkflow: string[];
  };
  findingsPreview?: SecurityFinding[];
  isStreaming?: boolean;
}

export interface IntentClassification {
  intent: string;
  category: 'reconnaissance' | 'network_scan' | 'web_assessment' | 'ssl_analysis' | 'api_testing' | 'log_analysis' | 'report_generation' | 'remediation_help' | 'general_qa';
  target?: string;
  targetType?: TargetType;
  authorizationRequired: boolean;
  authorizationStatus: 'granted' | 'pending' | 'not_required';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  recommendedWorkflow: string[];
  isPassive: boolean;
  missingInformation?: string[];
}

export interface ConversationThread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  associatedScanIds: string[];
}

export interface SecurityTool {
  id: string;
  name: string;
  category: 'Reconnaissance' | 'Web Security' | 'Vulnerability Assessment' | 'Network Analysis' | 'SSL/TLS' | 'Content Discovery' | 'API Testing';
  description: string;
  version: string;
  status: 'active' | 'ready' | 'sandboxed';
  supportedTargets: TargetType[];
  safetyLevel: 'Safe Passive' | 'Controlled Active' | 'Deep Active';
  commandTemplate?: string;
}

export interface VaptReport {
  id: string;
  scanId: string;
  target: string;
  title: string;
  generatedAt: string;
  executiveSummary: string;
  scope: {
    target: string;
    targetType: string;
    allowedScope: string[];
    testingPeriod: string;
  };
  methodology: string[];
  assetsTested: {
    asset: string;
    ip?: string;
    ports?: number[];
    technologies?: string[];
  }[];
  securityScore: number;
  findings: SecurityFinding[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  riskAnalysis: string;
  remediationRoadmap: {
    priority: string;
    timeline: string;
    actions: string[];
  }[];
  retestRecommendations: string[];
}
