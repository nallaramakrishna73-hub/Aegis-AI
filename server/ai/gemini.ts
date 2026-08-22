import { GoogleGenAI, Type } from '@google/genai';
import {
  IntentClassification,
  SecurityFinding,
  VaptReport,
  TargetType
} from '../../src/types';

let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return genAIClient;
}

// 1. Intent Classification Agent
export async function classifyIntentWithAI(userInput: string, targetContext?: string): Promise<IntentClassification> {
  const ai = getGenAI();

  if (ai) {
    try {
      const prompt = `You are the AI Intent Engine of an enterprise VAPT (Vulnerability Assessment & Penetration Testing) Security Copilot.
Analyze the following user input and extract structured intent, targets, safety classifications, and recommended workflows.

User Input: "${userInput}"
Context Target: "${targetContext || 'none'}"

Rules:
- NEVER execute destructive actions or attacks against unauthorized third parties.
- Distinguish between passive recon, network scanning, web app security testing, SSL audits, API tests, log/output analysis, report generation, and general advice.
- Active testing requires authorization confirmation.
- Output MUST strictly match the requested JSON schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              intent: { type: Type.STRING },
              category: {
                type: Type.STRING,
                enum: [
                  'reconnaissance',
                  'network_scan',
                  'web_assessment',
                  'ssl_analysis',
                  'api_testing',
                  'log_analysis',
                  'report_generation',
                  'remediation_help',
                  'general_qa'
                ]
              },
              target: { type: Type.STRING },
              targetType: {
                type: Type.STRING,
                enum: ['domain', 'subdomain', 'ip', 'cidr', 'url', 'api_endpoint']
              },
              authorizationRequired: { type: Type.BOOLEAN },
              authorizationStatus: {
                type: Type.STRING,
                enum: ['granted', 'pending', 'not_required']
              },
              riskLevel: {
                type: Type.STRING,
                enum: ['low', 'medium', 'high', 'critical']
              },
              confidence: { type: Type.NUMBER },
              recommendedWorkflow: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              isPassive: { type: Type.BOOLEAN },
              missingInformation: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: [
              'intent',
              'category',
              'authorizationRequired',
              'authorizationStatus',
              'riskLevel',
              'confidence',
              'recommendedWorkflow',
              'isPassive'
            ]
          }
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        return parsed as IntentClassification;
      }
    } catch (e: any) {
      console.warn('[Gemini AI Intent Fallback]:', e.message);
    }
  }

  // Deterministic Fallback Rule Engine
  return fallbackIntentClassifier(userInput, targetContext);
}

function fallbackIntentClassifier(input: string, targetContext?: string): IntentClassification {
  const text = input.toLowerCase();
  
  // Extract possible domain/URL from text
  const urlRegex = /(?:https?:\/\/)?([a-zA-Z0-9][-a-zA-Z0-9]{0,62}(?:\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+(?::[0-9]{1,5})?|\b(?:\d{1,3}\.){3}\d{1,3}\b|localhost(?::\d+)?)/i;
  const match = input.match(urlRegex);
  const detectedTarget = match ? match[0].replace(/^https?:\/\//, '').replace(/\/.*$/, '') : targetContext || undefined;

  let targetType: TargetType = 'domain';
  if (detectedTarget) {
    if (detectedTarget.includes('/api/') || detectedTarget.endsWith('.json')) targetType = 'api_endpoint';
    else if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(detectedTarget)) targetType = 'ip';
    else if (detectedTarget.includes('http://') || detectedTarget.includes('https://')) targetType = 'url';
    else if (detectedTarget.split('.').length > 2 && !detectedTarget.startsWith('www.')) targetType = 'subdomain';
  }

  // 1. Raw Log Analysis
  if (text.includes('analyze') && (text.includes('nmap') || text.includes('log') || text.includes('output') || text.includes('response') || text.includes('headers'))) {
    return {
      intent: 'raw_log_analysis',
      category: 'log_analysis',
      target: detectedTarget,
      targetType,
      authorizationRequired: false,
      authorizationStatus: 'not_required',
      riskLevel: 'low',
      confidence: 0.95,
      recommendedWorkflow: ['Parse Technical Log', 'Extract Vulnerability Signatures', 'Map CVSS Scores', 'Synthesize Remediation'],
      isPassive: true
    };
  }

  // 2. SSL/TLS Audit
  if (text.includes('ssl') || text.includes('tls') || text.includes('certificate') || text.includes('cert') || text.includes('cipher')) {
    return {
      intent: 'ssl_tls_security_audit',
      category: 'ssl_analysis',
      target: detectedTarget || 'example.com',
      targetType: 'domain',
      authorizationRequired: false,
      authorizationStatus: 'not_required',
      riskLevel: 'low',
      confidence: 0.96,
      recommendedWorkflow: ['Resolve DNS', 'Establish TLS Handshake', 'Inspect Certificate Expiry', 'Audit Cipher Suites', 'Check Protocol Downgrade'],
      isPassive: true
    };
  }

  // 3. Port Scan / Network Recon
  if (text.includes('port') || text.includes('open port') || text.includes('network scan') || text.includes('services')) {
    return {
      intent: 'network_port_scan',
      category: 'network_scan',
      target: detectedTarget || 'example.com',
      targetType: 'domain',
      authorizationRequired: true,
      authorizationStatus: 'pending',
      riskLevel: 'medium',
      confidence: 0.94,
      recommendedWorkflow: ['Validate Scope', 'Resolve DNS A/AAAA records', 'SYN/TCP Connect Probing', 'Service Banner Identification', 'Exposed Database Warning'],
      isPassive: false
    };
  }

  // 4. API Security Test
  if (text.includes('api') || text.includes('endpoint') || text.includes('swagger') || text.includes('openapi') || text.includes('graphql')) {
    return {
      intent: 'api_security_assessment',
      category: 'api_testing',
      target: detectedTarget || 'api.example.com',
      targetType: 'api_endpoint',
      authorizationRequired: true,
      authorizationStatus: 'pending',
      riskLevel: 'medium',
      confidence: 0.93,
      recommendedWorkflow: ['Validate Target API Scope', 'Discover Schema & Swagger', 'Check HTTP Verbs (OPTIONS/TRACE)', 'Audit Auth Headers & Rate Limits', 'Generate API Security Findings'],
      isPassive: false
    };
  }

  // 5. Report Generation
  if (text.includes('report') || text.includes('generate report') || text.includes('executive summary') || text.includes('export pdf')) {
    return {
      intent: 'generate_vapt_report',
      category: 'report_generation',
      target: detectedTarget,
      targetType,
      authorizationRequired: false,
      authorizationStatus: 'not_required',
      riskLevel: 'low',
      confidence: 0.97,
      recommendedWorkflow: ['Aggregate Scan Findings', 'Calculate Overall Security Score', 'Draft Executive Summary', 'Compile Remediation Roadmap', 'Format Multi-Format Report'],
      isPassive: true
    };
  }

  // 6. Full Web Vulnerability Assessment (Default VAPT)
  if (text.includes('scan') || text.includes('vapt') || text.includes('test') || text.includes('vulnerabilit') || text.includes('check') || text.includes('security')) {
    return {
      intent: 'web_vulnerability_assessment',
      category: 'web_assessment',
      target: detectedTarget || 'example.com',
      targetType,
      authorizationRequired: true,
      authorizationStatus: 'pending',
      riskLevel: 'high',
      confidence: 0.96,
      recommendedWorkflow: [
        'Target Scope & Authorization Validation',
        'Passive Reconnaissance & Technology Detection',
        'HTTP Security Headers & Transport Audit',
        'SSL/TLS Cryptographic Inspection',
        'Safe Web Application Vulnerability Probing',
        'AI Finding Correlation & CVSS Risk Scoring',
        'Remediation Synthesis & Report Generation'
      ],
      isPassive: false
    };
  }

  // 7. General Security QA
  return {
    intent: 'security_consultation_qa',
    category: 'general_qa',
    target: detectedTarget,
    targetType,
    authorizationRequired: false,
    authorizationStatus: 'not_required',
    riskLevel: 'low',
    confidence: 0.88,
    recommendedWorkflow: ['Analyze Security Query', 'Retrieve OWASP/NIST Best Practices', 'Synthesize Expert Security Response'],
    isPassive: true
  };
}

// 2. AI Security Analysis & Chat Response Agent
export async function generateCopilotResponse(params: {
  userInput: string;
  conversationHistory: Array<{ role: string; content: string }>;
  intent: IntentClassification;
  scanData?: any;
  authorized: boolean;
}): Promise<string> {
  const ai = getGenAI();

  if (ai) {
    try {
      const historyFormatted = params.conversationHistory
        .slice(-6)
        .map(m => `${m.role.toUpperCase()}: ${m.content}`)
        .join('\n\n');

      const systemInstruction = `You are Aegis-AI, an enterprise-grade AI Vulnerability Assessment & Penetration Testing (VAPT) Security Copilot.
You assist cybersecurity analysts, DevOps engineers, and security leads in performing structured, safe, authorized security assessments.

Core Directives:
1. Speak with professional, calm, highly technical precision (no cheesy marketing hype, no artificial emojis unless functionally relevant).
2. NEVER execute active scanning on unauthorized targets. Always verify authorization before active testing.
3. When summarizing assessment findings, provide:
   - Overall Security Score (0 - 100)
   - Severity Breakdown (Critical, High, Medium, Low, Info)
   - Highest-priority critical risks first with actionable remediation code snippets (Nginx, Express, Apache, Python, etc.)
   - Clear distinction between confirmed vulnerabilities and potential configuration warnings.
4. When analyzing raw logs or outputs (like Nmap, ZAP, or HTTP responses), parse them into structured findings and practical next steps.`;

      const prompt = `Conversation Context:
${historyFormatted}

User Query: "${params.userInput}"

Intent Engine Analysis:
${JSON.stringify(params.intent, null, 2)}

Active Target Authorized: ${params.authorized ? 'YES' : 'NO - REQUIRE USER CONFIRMATION'}

${params.scanData ? `Scan Data & Findings:\n${JSON.stringify(params.scanData, null, 2)}` : ''}

Generate a clear, high-signal response according to your role as a VAPT Copilot.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.4
        }
      });

      if (response.text) {
        return response.text;
      }
    } catch (e: any) {
      console.warn('[Gemini AI Response Fallback]:', e.message);
    }
  }

  // Deterministic high-quality fallback
  return fallbackCopilotResponse(params);
}

function fallbackCopilotResponse(params: {
  userInput: string;
  intent: IntentClassification;
  authorized: boolean;
  scanData?: any;
}): string {
  const target = params.intent.target || 'the specified target';

  if (params.intent.authorizationRequired && !params.authorized) {
    return `I can conduct a comprehensive security assessment of **${target}**.\n\n` +
      `Before initiating active scanning, legal authorization confirmation is required under the Monolith Security Protocol.\n\n` +
      `Please confirm that you have explicit permission to test **${target}** using the authorization checkpoint below.`;
  }

  if (params.scanData) {
    const findings = params.scanData.findings as SecurityFinding[] || [];
    const crit = findings.filter(f => f.severity === 'Critical').length;
    const high = findings.filter(f => f.severity === 'High').length;
    const med = findings.filter(f => f.severity === 'Medium').length;
    const low = findings.filter(f => f.severity === 'Low').length;

    return `### Security Assessment Completed: ${target}\n\n` +
      `**Security Score:** **${params.scanData.securityScore || 78}/100**\n\n` +
      `**Findings Summary:**\n` +
      (crit > 0 ? `• **${crit} Critical Risk${crit > 1 ? 's' : ''}**\n` : '') +
      (high > 0 ? `• **${high} High Risk${high > 1 ? 's' : ''}**\n` : '') +
      (med > 0 ? `• **${med} Medium Risk${med > 1 ? 's' : ''}**\n` : '') +
      (low > 0 ? `• **${low} Low Risk / Informational**\n` : '') +
      `\n` +
      (findings[0] ? `**Highest-Priority Finding:** **${findings[0].title}** (CVSS ${findings[0].cvss})\n${findings[0].description}\n\n**Remediation:** ${findings[0].remediation}` : 'No high-risk vulnerabilities detected on inspected endpoints.') +
      `\n\nYou can explore detailed evidence, raw tool logs, and download the full VAPT Report in the dashboard tabs.`;
  }

  return `Target **${target}** verified. I have structured a ${params.intent.recommendedWorkflow.length}-step assessment workflow including ${params.intent.recommendedWorkflow.slice(0, 3).join(', ')}.\n\nYou can observe live execution in the Active Scans monitor.`;
}

// 3. Raw Log Analyzer Agent
export async function analyzeRawLogWithAI(rawLog: string, toolHint?: string): Promise<{
  summary: string;
  securityScore: number;
  findings: SecurityFinding[];
}> {
  const ai = getGenAI();

  if (ai) {
    try {
      const prompt = `Analyze the following raw security tool output (${toolHint || 'Security Scanner Output'}).
Extract any security vulnerabilities, configuration anomalies, exposed ports, or software weaknesses into structured findings with CVSS v3.1 scores.

Raw Output:
\`\`\`
${rawLog.slice(0, 6000)}
\`\`\``;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              securityScore: { type: Type.NUMBER },
              findings: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    severity: {
                      type: Type.STRING,
                      enum: ['Critical', 'High', 'Medium', 'Low', 'Informational']
                    },
                    cvss: { type: Type.NUMBER },
                    cvssVector: { type: Type.STRING },
                    confidence: { type: Type.NUMBER },
                    affectedAsset: { type: Type.STRING },
                    description: { type: Type.STRING },
                    evidence: { type: Type.STRING },
                    impact: { type: Type.STRING },
                    remediation: { type: Type.STRING },
                    references: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    tool: { type: Type.STRING },
                    cwe: { type: Type.STRING }
                  },
                  required: ['title', 'severity', 'cvss', 'description', 'evidence', 'impact', 'remediation']
                }
              }
            },
            required: ['summary', 'securityScore', 'findings']
          }
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        const findings: SecurityFinding[] = (parsed.findings || []).map((f: any, idx: number) => ({
          ...f,
          id: `FIND-RAW-${Date.now()}-${idx + 1}`,
          affectedAsset: f.affectedAsset || 'Target System',
          confidence: f.confidence || 0.9,
          references: f.references || ['https://owasp.org'],
          tool: f.tool || toolHint || 'Log Analyzer',
          timestamp: new Date().toISOString()
        }));

        return {
          summary: parsed.summary,
          securityScore: parsed.securityScore,
          findings
        };
      }
    } catch (e: any) {
      console.warn('[Gemini AI Raw Analysis Fallback]:', e.message);
    }
  }

  // Deterministic Log Analysis Fallback
  const findings: SecurityFinding[] = [];
  const lines = rawLog.split('\n');

  if (rawLog.toLowerCase().includes('open') && rawLog.toLowerCase().includes('tcp')) {
    findings.push({
      id: `FIND-RAW-${Date.now()}-1`,
      title: 'Open Network Port Detected in Log',
      severity: 'Medium',
      cvss: 5.3,
      confidence: 0.95,
      affectedAsset: 'Target Host',
      description: 'The provided log shows one or more open TCP service ports.',
      evidence: lines.filter(l => l.includes('open') || l.includes('tcp')).slice(0, 5).join('\n'),
      impact: 'Exposes network services to external exploration and potential unauthenticated interaction.',
      remediation: 'Review and close unnecessary ports using local firewall rules.',
      references: ['https://cwe.mitre.org/data/definitions/284.html'],
      tool: toolHint || 'Nmap Analyzer',
      timestamp: new Date().toISOString()
    });
  }

  if (rawLog.toLowerCase().includes('sql') || rawLog.toLowerCase().includes('syntax error')) {
    findings.push({
      id: `FIND-RAW-${Date.now()}-2`,
      title: 'Database Error / SQL Injection Indicator',
      severity: 'High',
      cvss: 8.5,
      confidence: 0.92,
      affectedAsset: 'Web Application',
      description: 'The output contains database exception fragments indicating unparameterized input reflection.',
      evidence: lines.filter(l => l.toLowerCase().includes('sql') || l.toLowerCase().includes('error')).slice(0, 3).join('\n'),
      impact: 'Potential arbitrary SQL command execution and database exfiltration.',
      remediation: 'Ensure all database queries use parameterized prepared statements.',
      references: ['https://owasp.org/www-community/attacks/SQL_Injection'],
      tool: toolHint || 'Web Log Analyzer',
      cwe: 'CWE-89',
      timestamp: new Date().toISOString()
    });
  }

  return {
    summary: `Analyzed ${lines.length} lines of technical output. Extracted ${findings.length} findings.`,
    securityScore: findings.length > 0 ? 70 : 92,
    findings
  };
}
