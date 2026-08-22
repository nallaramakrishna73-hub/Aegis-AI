import {
  ScanJob,
  SecurityFinding,
  AuthorizationRecord,
  ConversationThread,
  SecurityTool,
  VaptReport
} from '../src/types';

// In-memory data store with predefined authorized demo targets and tools catalog
export class Database {
  private scans: Map<string, ScanJob> = new Map();
  private authorizations: Map<string, AuthorizationRecord> = new Map();
  private conversations: Map<string, ConversationThread> = new Map();
  private tools: Map<string, SecurityTool> = new Map();
  private reports: Map<string, VaptReport> = new Map();
  private auditLogs: Array<{ timestamp: string; action: string; user: string; details: any }> = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Initial authorized security tools
    const toolList: SecurityTool[] = [
      {
        id: 'nmap',
        name: 'Nmap Network Scanner',
        category: 'Network Analysis',
        description: 'Host discovery, safe port probing (SYN/TCP Connect), and service banner identification.',
        version: '7.94',
        status: 'active',
        supportedTargets: ['domain', 'ip', 'cidr'],
        safetyLevel: 'Controlled Active',
        commandTemplate: 'nmap -sS -sV -T4 --top-ports 100 {target}'
      },
      {
        id: 'owasp_zap',
        name: 'OWASP ZAP Core Engine',
        category: 'Web Security',
        description: 'Automated web vulnerability scanner for injection flaws, missing headers, and insecure cookies.',
        version: '2.14.0',
        status: 'active',
        supportedTargets: ['url', 'domain'],
        safetyLevel: 'Controlled Active',
        commandTemplate: 'zap-cli quick-scan --self-contained {target}'
      },
      {
        id: 'nuclei',
        name: 'Nuclei Template Engine',
        category: 'Vulnerability Assessment',
        description: 'Fast, community-driven vulnerability and misconfiguration scanner based on YAML templates.',
        version: 'v3.2.1',
        status: 'active',
        supportedTargets: ['url', 'domain', 'ip'],
        safetyLevel: 'Controlled Active',
        commandTemplate: 'nuclei -u {target} -t cves/,misconfiguration/'
      },
      {
        id: 'ssl_audit',
        name: 'SSL/TLS Cipher & Cert Inspector',
        category: 'SSL/TLS',
        description: 'Deep cryptographic analysis of TLS certificates, weak ciphers, PFS support, and expiration.',
        version: '1.2.0',
        status: 'active',
        supportedTargets: ['domain', 'url'],
        safetyLevel: 'Safe Passive',
        commandTemplate: 'testssl.sh --quiet --color 0 {target}'
      },
      {
        id: 'http_headers',
        name: 'HTTP Security Headers Prober',
        category: 'Web Security',
        description: 'Analyzes HSTS, Content-Security-Policy, X-Frame-Options, CORS origin validation, and Cache controls.',
        version: '2.0.0',
        status: 'active',
        supportedTargets: ['domain', 'url', 'api_endpoint'],
        safetyLevel: 'Safe Passive',
        commandTemplate: 'sec-headers-check {target}'
      },
      {
        id: 'whatweb',
        name: 'Technology Fingerprinter',
        category: 'Reconnaissance',
        description: 'Identifies content management systems, web frameworks, web servers, and analytics libraries.',
        version: '0.5.5',
        status: 'active',
        supportedTargets: ['domain', 'url'],
        safetyLevel: 'Safe Passive',
        commandTemplate: 'whatweb -a 1 {target}'
      },
      {
        id: 'api_prober',
        name: 'API Security Analyzer',
        category: 'API Testing',
        description: 'Probes OpenAPI/Swagger endpoints, unauthenticated method reflection, rate limiting, and verb tampering.',
        version: '1.4.0',
        status: 'active',
        supportedTargets: ['api_endpoint', 'url'],
        safetyLevel: 'Controlled Active',
        commandTemplate: 'api-sec-probe -e {target}'
      },
      {
        id: 'nikto',
        name: 'Nikto Web Vulnerability Scanner',
        category: 'Web Security',
        description: 'Comprehensive web server scanner for dangerous files, outdated server software, and CGIs.',
        version: '2.5.0',
        status: 'sandboxed',
        supportedTargets: ['domain', 'url'],
        safetyLevel: 'Controlled Active',
        commandTemplate: 'nikto -host {target} -Tuning 123b'
      },
      {
        id: 'subfinder',
        name: 'Subfinder Subdomain Enum',
        category: 'Reconnaissance',
        description: 'Passive subdomain discovery tool that discovers valid subdomains using passive online sources.',
        version: 'v2.6.4',
        status: 'active',
        supportedTargets: ['domain'],
        safetyLevel: 'Safe Passive',
        commandTemplate: 'subfinder -d {target} -silent'
      }
    ];

    toolList.forEach(t => this.tools.set(t.id, t));

    // Seed an initial authorization record for testing environments
    const auth1: AuthorizationRecord = {
      id: 'AUTH-DEMO-2026',
      target: 'testphp.vulnweb.com',
      targetType: 'domain',
      allowedScope: ['*.testphp.vulnweb.com', 'testphp.vulnweb.com'],
      testType: 'full_vapt',
      confirmedBy: 'Security Lead (nallaramakrishna73@gmail.com)',
      confirmedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
      status: 'active',
      statement: 'I confirm that I have permission to perform security testing against this target for educational/assessment purposes.'
    };
    this.authorizations.set(auth1.id, auth1);

    const auth2: AuthorizationRecord = {
      id: 'AUTH-LOCAL-3000',
      target: 'localhost:3000',
      targetType: 'domain',
      allowedScope: ['localhost:3000', '127.0.0.1:3000'],
      testType: 'active_safe',
      confirmedBy: 'Operator (Local Applet)',
      confirmedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000 * 90).toISOString(),
      status: 'active',
      statement: 'I confirm that I have permission to perform security testing against this target.'
    };
    this.authorizations.set(auth2.id, auth2);

    // Initial Seed Scans
    const initialFindings: SecurityFinding[] = [
      {
        id: 'FIND-001',
        title: 'Missing Content-Security-Policy (CSP) Header',
        severity: 'Medium',
        cvss: 5.4,
        cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:L/I:L/A:N',
        confidence: 0.98,
        affectedAsset: 'https://testphp.vulnweb.com/',
        description: 'The Content-Security-Policy HTTP header is not implemented. CSP prevents Cross-Site Scripting (XSS) and data injection attacks by restricting resources that the browser is allowed to load.',
        evidence: 'Response Headers:\nHTTP/1.1 200 OK\nServer: nginx/1.19.0\nContent-Type: text/html\n(No Content-Security-Policy found)',
        impact: 'Attackers can execute malicious client-side JavaScript or inject malicious iframes/scripts into victim sessions.',
        remediation: 'Implement a restrictive Content-Security-Policy response header specifying allowed script, style, and frame sources.',
        remediationCode: [
          {
            language: 'nginx',
            filename: 'nginx.conf',
            snippet: 'add_header Content-Security-Policy "default-src \'self\'; script-src \'self\' https://trustedscripts.org; object-src \'none\';" always;'
          },
          {
            language: 'javascript',
            filename: 'server.js',
            snippet: 'const helmet = require("helmet");\napp.use(helmet.contentSecurityPolicy());'
          }
        ],
        references: [
          'https://owasp.org/www-project-secure-headers/#content-security-policy',
          'https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP'
        ],
        tool: 'HTTP Security Headers Prober',
        cwe: 'CWE-693',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: 'FIND-002',
        title: 'Missing HTTP Strict-Transport-Security (HSTS)',
        severity: 'Medium',
        cvss: 5.3,
        cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N',
        confidence: 0.99,
        affectedAsset: 'https://testphp.vulnweb.com/',
        description: 'The HTTP Strict-Transport-Security (HSTS) header is missing, allowing potential SSL-stripping and man-in-the-middle attacks over unencrypted channels.',
        evidence: 'Strict-Transport-Security header was absent from HTTPS response.',
        impact: 'Users may inadvertently connect over HTTP or be downgraded by network adversaries via SSL Strip attacks.',
        remediation: 'Configure HSTS with a max-age of at least 1 year (31536000 seconds) and include subdomains.',
        remediationCode: [
          {
            language: 'nginx',
            filename: 'nginx.conf',
            snippet: 'add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;'
          }
        ],
        references: [
          'https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html'
        ],
        tool: 'HTTP Security Headers Prober',
        cwe: 'CWE-523',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: 'FIND-003',
        title: 'Potential SQL Injection in Parameter `cat`',
        severity: 'High',
        cvss: 8.6,
        cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N',
        confidence: 0.92,
        affectedAsset: 'https://testphp.vulnweb.com/listproducts.php?cat=1',
        description: 'Single quote parameter mutation returned database error tokens (MySQL syntax error: "You have an error in your SQL syntax near ..."). This indicates raw parameter concatenation without parameterized statements.',
        evidence: 'Payload: `cat=1\' OR \'1\'=\'1`\nResponse diff: 28 additional records reflected with HTTP 200 and SQL warning fragment.',
        impact: 'Unauthorized database exfiltration, authentication bypass, data manipulation, or database compromise.',
        remediation: 'Use parameterized prepared statements with PDO / MySQLi or ORM query builders. Never concatenate user input into queries.',
        remediationCode: [
          {
            language: 'php',
            filename: 'listproducts.php',
            snippet: '$stmt = $pdo->prepare("SELECT * FROM products WHERE category = :cat");\n$stmt->execute([\'cat\' => $_GET[\'cat\']]);\n$products = $stmt->fetchAll();'
          },
          {
            language: 'python',
            filename: 'views.py',
            snippet: 'cursor.execute("SELECT * FROM products WHERE category = %s", (category_id,))'
          }
        ],
        references: [
          'https://owasp.org/www-community/attacks/SQL_Injection',
          'https://cwe.mitre.org/data/definitions/89.html'
        ],
        tool: 'OWASP ZAP Core Engine',
        cwe: 'CWE-89',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: 'FIND-004',
        title: 'Server Version Disclosure (Nginx/1.19.0)',
        severity: 'Low',
        cvss: 3.1,
        cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N',
        confidence: 1.0,
        affectedAsset: 'https://testphp.vulnweb.com/',
        description: 'The web server reveals its exact version string in the `Server` HTTP header, assisting attackers in targeting known CVE exploits for Nginx 1.19.0.',
        evidence: 'Server: nginx/1.19.0',
        impact: 'Facilitates reconnaissance by providing attackers with exact software version for targeted exploit matching.',
        remediation: 'Disable server tokens in web server configuration.',
        remediationCode: [
          {
            language: 'nginx',
            filename: 'nginx.conf',
            snippet: 'server_tokens off;'
          }
        ],
        references: [
          'https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/01-Information_Gathering/02-Fingerprint_Web_Server'
        ],
        tool: 'Technology Fingerprinter',
        cwe: 'CWE-200',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
      }
    ];

    const sampleScan: ScanJob = {
      id: 'SCAN-8921-VAPT',
      target: 'testphp.vulnweb.com',
      targetType: 'domain',
      title: 'Full Web Security Assessment — testphp.vulnweb.com',
      scanType: 'web_vapt',
      status: 'completed',
      startTime: new Date(Date.now() - 3600000 * 5.2).toISOString(),
      endTime: new Date(Date.now() - 3600000 * 5.0).toISOString(),
      securityScore: 64,
      authorized: true,
      authorizationId: 'AUTH-DEMO-2026',
      workflow: [
        {
          id: 'step-1',
          name: 'Target Scope & Authorization Validation',
          description: 'Verifies domain ownership declaration, DNS resolution, and scope boundaries.',
          tool: 'Scope Validator',
          status: 'completed',
          durationMs: 420,
          outputSummary: 'Target validated. Resolved to 44.228.249.3. Authorization active.',
          rawLogs: ['[VALIDATION] Checking authorization token AUTH-DEMO-2026...', '[VALIDATION] Scope verified: *.testphp.vulnweb.com', '[DNS] Host resolved to IP: 44.228.249.3']
        },
        {
          id: 'step-2',
          name: 'Passive Reconnaissance & Tech Detection',
          description: 'Detects web servers, runtime stacks, and public endpoints without intrusive payloads.',
          tool: 'WhatWeb Fingerprinter',
          status: 'completed',
          durationMs: 1200,
          outputSummary: 'Identified Nginx/1.19.0, PHP 5.6, HTML5, Apache/CGI components.',
          rawLogs: ['[RECON] Sending benign HEAD probe to https://testphp.vulnweb.com', '[TECH] Detected Nginx 1.19.0', '[TECH] Detected PHP/5.6.40-38', '[RECON] Robots.txt scanned']
        },
        {
          id: 'step-3',
          name: 'HTTP Security Headers & Transport Security',
          description: 'Audits HSTS, CSP, X-Frame-Options, and Cookie security flags.',
          tool: 'HTTP Headers Prober',
          status: 'completed',
          durationMs: 850,
          outputSummary: 'Found 2 header misconfigurations (Missing CSP, Missing HSTS).',
          findingsCount: 3,
          rawLogs: ['[HEADERS] Evaluating 12 standard security headers...', '[WARN] CSP missing', '[WARN] HSTS missing', '[INFO] X-Content-Type-Options: nosniff present']
        },
        {
          id: 'step-4',
          name: 'SSL/TLS Cryptographic Audit',
          description: 'Inspects certificate validity, cipher suites, and TLS protocol versions.',
          tool: 'SSL/TLS Inspector',
          status: 'completed',
          durationMs: 1100,
          outputSummary: 'TLS 1.2 and TLS 1.3 enabled. RSA 2048-bit certificate valid for 180 days.',
          rawLogs: ['[TLS] Handshake initialized to port 443', '[TLS] Protocol: TLSv1.3, Cipher: TLS_AES_256_GCM_SHA384', '[TLS] Cert Subject: CN=testphp.vulnweb.com', '[TLS] No weak legacy ciphers detected']
        },
        {
          id: 'step-5',
          name: 'Safe Web Vulnerability Assessment',
          description: 'Executes non-destructive OWASP Top 10 automated test suites.',
          tool: 'OWASP ZAP Core Engine',
          status: 'completed',
          durationMs: 4600,
          outputSummary: 'Identified 1 High risk SQLi candidate on parameter `cat`.',
          findingsCount: 1,
          rawLogs: ['[ZAP] Testing injection surfaces across 14 discovered endpoints...', '[ALERT] High confidence SQL syntax deviation observed on /listproducts.php?cat=1', '[ZAP] Passive audit completed']
        },
        {
          id: 'step-6',
          name: 'AI Correlation, Risk Scoring & Report Synthesis',
          description: 'Correlates raw findings, calculates CVSS v3.1 scores, and generates remediation.',
          tool: 'Gemini AI Security Engine',
          status: 'completed',
          durationMs: 1900,
          outputSummary: 'Final Security Score: 64/100. 4 findings correlated with actionable fixes.',
          rawLogs: ['[AI] Correlating 4 raw findings...', '[AI] Calculated overall security score: 64', '[AI] Executive summary and remediation roadmap synthesized.']
        }
      ],
      findings: initialFindings,
      logs: [
        '[SYSTEM] VAPT Scan Job SCAN-8921-VAPT initialized',
        '[AUTH] Verified authorization token AUTH-DEMO-2026',
        '[WORKFLOW] 6-stage pipeline compiled by AI Orchestrator',
        '[EXEC] Executed Scope Validator -> OK',
        '[EXEC] Executed WhatWeb Fingerprinter -> OK',
        '[EXEC] Executed HTTP Headers Prober -> 2 Findings',
        '[EXEC] Executed SSL/TLS Inspector -> OK',
        '[EXEC] Executed OWASP ZAP Core Engine -> 1 Finding (High)',
        '[AI] Analysis complete. Overall score: 64/100'
      ],
      summary: {
        critical: 0,
        high: 1,
        medium: 2,
        low: 1,
        info: 0,
        total: 4
      }
    };
    this.scans.set(sampleScan.id, sampleScan);

    // Initial Conversation
    const conv1: ConversationThread = {
      id: 'CONV-SAMPLE-1',
      title: 'Full Assessment — testphp.vulnweb.com',
      createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      associatedScanIds: [sampleScan.id],
      messages: [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Scan my website testphp.vulnweb.com for security vulnerabilities and give me a full VAPT assessment.',
          timestamp: new Date(Date.now() - 3600000 * 6).toISOString()
        },
        {
          id: 'msg-2',
          role: 'assistant',
          content: 'I have analyzed your request. To conduct an active web vulnerability assessment on `testphp.vulnweb.com`, we require confirmed testing authorization.',
          timestamp: new Date(Date.now() - 3600000 * 5.9).toISOString(),
          intent: {
            intent: 'web_vulnerability_assessment',
            category: 'web_assessment',
            target: 'testphp.vulnweb.com',
            targetType: 'domain',
            authorizationRequired: true,
            authorizationStatus: 'granted',
            riskLevel: 'high',
            confidence: 0.98,
            recommendedWorkflow: [
              'Target & Scope Validation',
              'Passive Reconnaissance & Technology Detection',
              'HTTP Security Headers & SSL/TLS Audit',
              'Safe Web Vulnerability Scanning (OWASP ZAP)',
              'AI Security Correlation & Risk Scoring'
            ],
            isPassive: false
          }
        },
        {
          id: 'msg-3',
          role: 'assistant',
          content: 'Assessment completed for **testphp.vulnweb.com**.\n\n**Security Score: 64/100**\n\n**Findings Summary:**\n• **1 High** (Potential SQL Injection in parameter `cat`)\n• **2 Medium** (Missing Content-Security-Policy, Missing HSTS)\n• **1 Low** (Server Header Version Disclosure)\n\n**Top Priority:** The parameter `cat` on `/listproducts.php` is vulnerable to SQL injection. Implement parameterized queries immediately.',
          timestamp: new Date(Date.now() - 3600000 * 5.0).toISOString(),
          scanId: sampleScan.id,
          findingsPreview: initialFindings
        }
      ]
    };
    this.conversations.set(conv1.id, conv1);

    // Initial Report
    const report1: VaptReport = {
      id: 'REP-' + sampleScan.id,
      scanId: sampleScan.id,
      target: sampleScan.target,
      title: 'Vulnerability Assessment & Penetration Testing Report — ' + sampleScan.target,
      generatedAt: new Date().toISOString(),
      executiveSummary: 'An automated security assessment was performed against ' + sampleScan.target + '. The assessment identified 1 High severity vulnerability, 2 Medium severity configuration weaknesses, and 1 Low severity information disclosure issue. The overall calculated Security Score is 64/100.',
      scope: {
        target: sampleScan.target,
        targetType: sampleScan.targetType,
        allowedScope: ['*.testphp.vulnweb.com', 'testphp.vulnweb.com'],
        testingPeriod: `${sampleScan.startTime} to ${sampleScan.endTime || new Date().toISOString()}`
      },
      methodology: [
        'Passive Reconnaissance & DNS/Technology Detection',
        'Transport Layer Security (TLS/SSL) Inspection',
        'HTTP Protocol & Security Headers Verification',
        'OWASP Top 10 Automated Surface Probing',
        'AI Correlation and CVSS v3.1 Severity Classification'
      ],
      assetsTested: [
        {
          asset: 'https://testphp.vulnweb.com',
          ip: '44.228.249.3',
          ports: [80, 443],
          technologies: ['Nginx 1.19.0', 'PHP 5.6.40', 'HTML5']
        }
      ],
      securityScore: 64,
      findings: initialFindings,
      summary: {
        critical: 0,
        high: 1,
        medium: 2,
        low: 1,
        info: 0
      },
      riskAnalysis: 'The high-priority finding (SQL Injection) allows unauthenticated attackers to tamper with backend data queries. Missing security headers lower defensive barriers against cross-site scripting and SSL stripping attacks.',
      remediationRoadmap: [
        {
          priority: 'Immediate (24-48 Hours)',
          timeline: 'P0',
          actions: ['Refactor database queries using parameterized prepared statements for `cat` parameter.']
        },
        {
          priority: 'Short Term (1 Week)',
          timeline: 'P1',
          actions: [
            'Deploy Content-Security-Policy (CSP) header in web server configuration.',
            'Deploy HTTP Strict-Transport-Security (HSTS) with 1 year max-age.'
          ]
        },
        {
          priority: 'Medium Term (2 Weeks)',
          timeline: 'P2',
          actions: [
            'Hide server tokens (`server_tokens off`) in Nginx configuration.',
            'Schedule continuous automated regression scans.'
          ]
        }
      ],
      retestRecommendations: [
        'Re-run automated SQL injection probe on /listproducts.php once prepared statements are deployed.',
        'Validate browser header enforcement using HTTP Security Headers Prober.',
        'Confirm SSL certificate renewal automation.'
      ]
    };
    this.reports.set(report1.id, report1);
  }

  // Scans
  getAllScans(): ScanJob[] {
    return Array.from(this.scans.values()).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }

  getScan(id: string): ScanJob | undefined {
    return this.scans.get(id);
  }

  saveScan(scan: ScanJob): ScanJob {
    this.scans.set(scan.id, scan);
    return scan;
  }

  deleteScan(id: string): boolean {
    return this.scans.delete(id);
  }

  // Findings
  getAllFindings(): SecurityFinding[] {
    const allFindings: SecurityFinding[] = [];
    for (const scan of this.scans.values()) {
      allFindings.push(...scan.findings);
    }
    // Remove duplicates by ID
    const unique = new Map<string, SecurityFinding>();
    allFindings.forEach(f => unique.set(f.id, f));
    return Array.from(unique.values()).sort((a, b) => b.cvss - a.cvss);
  }

  // Authorizations
  getAllAuthorizations(): AuthorizationRecord[] {
    return Array.from(this.authorizations.values());
  }

  getAuthorization(id: string): AuthorizationRecord | undefined {
    return this.authorizations.get(id);
  }

  findAuthorizationForTarget(target: string): AuthorizationRecord | undefined {
    const cleanTarget = target.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
    for (const auth of this.authorizations.values()) {
      if (auth.status !== 'active') continue;
      const cleanAuthTarget = auth.target.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
      if (cleanAuthTarget === cleanTarget) return auth;
      if (cleanTarget.endsWith('.' + cleanAuthTarget) || cleanAuthTarget.endsWith('.' + cleanTarget)) return auth;
      if (cleanTarget === 'localhost' || cleanTarget.startsWith('127.0.0.1')) return auth;
    }
    return undefined;
  }

  saveAuthorization(auth: AuthorizationRecord): AuthorizationRecord {
    this.authorizations.set(auth.id, auth);
    this.logAudit('AUTHORIZATION_CREATED', auth.confirmedBy, { target: auth.target, id: auth.id });
    return auth;
  }

  revokeAuthorization(id: string): boolean {
    const auth = this.authorizations.get(id);
    if (auth) {
      auth.status = 'revoked';
      this.authorizations.set(id, auth);
      this.logAudit('AUTHORIZATION_REVOKED', 'User', { id });
      return true;
    }
    return false;
  }

  // Conversations
  getAllConversations(): ConversationThread[] {
    return Array.from(this.conversations.values()).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  getConversation(id: string): ConversationThread | undefined {
    return this.conversations.get(id);
  }

  saveConversation(conv: ConversationThread): ConversationThread {
    conv.updatedAt = new Date().toISOString();
    this.conversations.set(conv.id, conv);
    return conv;
  }

  deleteConversation(id: string): boolean {
    return this.conversations.delete(id);
  }

  // Tools
  getAllTools(): SecurityTool[] {
    return Array.from(this.tools.values());
  }

  getTool(id: string): SecurityTool | undefined {
    return this.tools.get(id);
  }

  // Reports
  getAllReports(): VaptReport[] {
    return Array.from(this.reports.values()).sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
  }

  getReport(id: string): VaptReport | undefined {
    return this.reports.get(id);
  }

  saveReport(report: VaptReport): VaptReport {
    this.reports.set(report.id, report);
    return report;
  }

  // Audit Logs
  logAudit(action: string, user: string, details: any) {
    this.auditLogs.unshift({
      timestamp: new Date().toISOString(),
      action,
      user,
      details
    });
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
  }

  getAuditLogs() {
    return this.auditLogs;
  }
}

export const db = new Database();
