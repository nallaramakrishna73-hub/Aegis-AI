import { Router, Request, Response } from 'express';
import { db } from '../db';
import { classifyIntentWithAI, generateCopilotResponse, analyzeRawLogWithAI } from '../ai/gemini';
import { createAndRunScan, subscribeToScanEvents, cancelScan } from '../orchestrator/scanManager';
import {
  ChatMessage,
  ConversationThread,
  AuthorizationRecord,
  TargetType,
  ScanJob
} from '../../src/types';

export const apiRouter = Router();

// 1. Health check
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    engine: 'Aegis-AI VAPT Core v2.4.0',
    capabilities: ['gemini-3.7-flash', 'nmap', 'owasp_zap', 'nuclei', 'ssl_audit', 'http_headers', 'sse_streaming']
  });
});

// 2. Chat Endpoint (AI Intent + Copilot Orchestration)
apiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, conversationId, targetContext } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    // Step A: Classify user intent
    const intent = await classifyIntentWithAI(message, targetContext);

    // Step B: Resolve or create conversation
    let conv: ConversationThread | undefined;
    if (conversationId) {
      conv = db.getConversation(conversationId);
    }
    if (!conv) {
      const newId = `CONV-${Date.now()}`;
      const title = intent.target
        ? `${intent.intent.replace(/_/g, ' ').toUpperCase()} — ${intent.target}`
        : message.slice(0, 36) + (message.length > 36 ? '...' : '');
      conv = {
        id: newId,
        title,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
        associatedScanIds: []
      };
      db.saveConversation(conv);
    }

    // Append user message
    const userMsg: ChatMessage = {
      id: `msg-u-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      intent
    };
    conv.messages.push(userMsg);

    // Step C: Check authorization if active testing required
    let target = intent.target || targetContext;
    let authRecord: AuthorizationRecord | undefined;
    if (target) {
      authRecord = db.findAuthorizationForTarget(target);
    }

    const isAuthorized = !!authRecord;
    let triggeredScanId: string | undefined;
    let scanData: any = undefined;

    // If intent is active scan and authorized, automatically launch scan
    if (intent.category !== 'general_qa' && intent.category !== 'report_generation' && intent.category !== 'log_analysis' && target && isAuthorized) {
      const scanType = intent.category === 'network_scan' ? 'network_ports'
        : intent.category === 'ssl_analysis' ? 'ssl_audit'
        : intent.category === 'api_testing' ? 'api_security'
        : intent.category === 'reconnaissance' ? 'quick_recon'
        : 'web_vapt';

      const newScan = await createAndRunScan({
        target,
        targetType: intent.targetType || 'domain',
        scanType,
        authorizationId: authRecord?.id,
        user: 'Operator'
      });

      triggeredScanId = newScan.id;
      conv.associatedScanIds.push(newScan.id);
      scanData = newScan;
    }

    // Step D: Generate Copilot AI response
    const aiText = await generateCopilotResponse({
      userInput: message,
      conversationHistory: conv.messages.map(m => ({ role: m.role, content: m.content })),
      intent,
      scanData,
      authorized: isAuthorized
    });

    const assistantMsg: ChatMessage = {
      id: `msg-a-${Date.now()}`,
      role: 'assistant',
      content: aiText,
      timestamp: new Date().toISOString(),
      intent,
      scanId: triggeredScanId,
      authorizationRequest: (!isAuthorized && intent.authorizationRequired && target) ? {
        target,
        targetType: intent.targetType || 'domain',
        scope: target,
        suggestedWorkflow: intent.recommendedWorkflow
      } : undefined,
      findingsPreview: scanData?.findings
    };

    conv.messages.push(assistantMsg);
    db.saveConversation(conv);

    res.json({
      conversationId: conv.id,
      message: assistantMsg,
      intent,
      scanId: triggeredScanId,
      isAuthorized
    });
  } catch (error: any) {
    console.error('[Chat Route Error]:', error);
    res.status(500).json({ error: error.message || 'Internal server error processing chat query.' });
  }
});

// 3. Scans Endpoints
apiRouter.post('/scans', async (req: Request, res: Response) => {
  try {
    const { target, targetType, scanType, authorizationId } = req.body;
    if (!target) {
      return res.status(400).json({ error: 'Target domain, URL, or IP is required.' });
    }

    const cleanTarget = target.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const auth = authorizationId ? db.getAuthorization(authorizationId) : db.findAuthorizationForTarget(cleanTarget);

    if (!auth) {
      return res.status(403).json({
        error: 'Authorization Required. Active security assessments require permission confirmation.',
        requiresAuthorization: true,
        target: cleanTarget
      });
    }

    const scan = await createAndRunScan({
      target: cleanTarget,
      targetType: targetType || 'domain',
      scanType: scanType || 'web_vapt',
      authorizationId: auth.id,
      user: 'Operator'
    });

    res.json(scan);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/scans', (req: Request, res: Response) => {
  res.json(db.getAllScans());
});

apiRouter.get('/scans/:id', (req: Request, res: Response) => {
  const scan = db.getScan(req.params.id);
  if (!scan) return res.status(404).json({ error: 'Scan not found' });
  res.json(scan);
});

// SSE Live Stream for Scan Execution
apiRouter.get('/scans/:id/stream', (req: Request, res: Response) => {
  const scanId = req.params.id;
  const scan = db.getScan(scanId);

  if (!scan) {
    return res.status(404).json({ error: 'Scan not found' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send initial state
  res.write(`event: initial_state\ndata: ${JSON.stringify(scan)}\n\n`);

  const unsubscribe = subscribeToScanEvents(scanId, (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  });

  req.on('close', () => {
    unsubscribe();
  });
});

apiRouter.post('/scans/:id/cancel', (req: Request, res: Response) => {
  const ok = cancelScan(req.params.id);
  if (!ok) return res.status(400).json({ error: 'Could not cancel scan or scan is already completed.' });
  res.json({ message: 'Scan cancelled successfully', scanId: req.params.id });
});

apiRouter.get('/scans/:id/workflow', (req: Request, res: Response) => {
  const scan = db.getScan(req.params.id);
  if (!scan) return res.status(404).json({ error: 'Scan not found' });
  res.json({ workflow: scan.workflow, status: scan.status, progress: scan.workflow.filter(s => s.status === 'completed').length / scan.workflow.length });
});

apiRouter.get('/scans/:id/findings', (req: Request, res: Response) => {
  const scan = db.getScan(req.params.id);
  if (!scan) return res.status(404).json({ error: 'Scan not found' });
  res.json(scan.findings);
});

// 4. Vulnerabilities
apiRouter.get('/vulnerabilities', (req: Request, res: Response) => {
  res.json(db.getAllFindings());
});

// 5. Authorizations
apiRouter.get('/authorization', (req: Request, res: Response) => {
  res.json(db.getAllAuthorizations());
});

apiRouter.post('/authorization', (req: Request, res: Response) => {
  const { target, targetType, allowedScope, testType, confirmedBy, statement } = req.body;
  if (!target) return res.status(400).json({ error: 'Target is required.' });

  const cleanTarget = target.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const id = `AUTH-${Date.now().toString().slice(-6)}`;

  const newAuth: AuthorizationRecord = {
    id,
    target: cleanTarget,
    targetType: targetType || 'domain',
    allowedScope: allowedScope || [cleanTarget, `*.${cleanTarget}`],
    testType: testType || 'full_vapt',
    confirmedBy: confirmedBy || 'Authorized Operator',
    confirmedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
    status: 'active',
    statement: statement || 'I confirm that I have permission to perform security testing against this target.'
  };

  db.saveAuthorization(newAuth);
  res.json(newAuth);
});

apiRouter.delete('/authorization/:id', (req: Request, res: Response) => {
  const success = db.revokeAuthorization(req.params.id);
  if (!success) return res.status(404).json({ error: 'Authorization record not found' });
  res.json({ message: 'Authorization revoked' });
});

// 6. Reports
apiRouter.get('/reports', (req: Request, res: Response) => {
  res.json(db.getAllReports());
});

apiRouter.get('/reports/:id', (req: Request, res: Response) => {
  const report = db.getReport(req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  res.json(report);
});

// 7. Conversations History
apiRouter.get('/history', (req: Request, res: Response) => {
  res.json(db.getAllConversations());
});

apiRouter.post('/history', (req: Request, res: Response) => {
  const { title } = req.body;
  const newConv: ConversationThread = {
    id: `CONV-${Date.now()}`,
    title: title || 'New Security Assessment',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [],
    associatedScanIds: []
  };
  db.saveConversation(newConv);
  res.json(newConv);
});

apiRouter.get('/history/:id', (req: Request, res: Response) => {
  const conv = db.getConversation(req.params.id);
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });
  res.json(conv);
});

apiRouter.delete('/history/:id', (req: Request, res: Response) => {
  const ok = db.deleteConversation(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Conversation not found' });
  res.json({ message: 'Conversation deleted' });
});

// 8. Raw Log Analysis
apiRouter.post('/analyze-raw', async (req: Request, res: Response) => {
  try {
    const { rawLog, toolHint } = req.body;
    if (!rawLog) return res.status(400).json({ error: 'Raw log content is required.' });

    const result = await analyzeRawLogWithAI(rawLog, toolHint);

    // Optionally create a Scan job record for history
    const scanId = `SCAN-RAW-${Date.now().toString().slice(-4)}`;
    const rawScan: ScanJob = {
      id: scanId,
      target: 'Raw Log Import',
      targetType: 'domain',
      title: `Raw Output Analysis — ${toolHint || 'Log Import'}`,
      scanType: 'raw_analysis',
      status: 'completed',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      securityScore: result.securityScore,
      workflow: [
        {
          id: 'step-parse',
          name: 'Log Parsing & Token Extraction',
          description: 'Parsed raw text stream and identified anomalies.',
          tool: toolHint || 'Log Parser',
          status: 'completed',
          outputSummary: result.summary,
          findingsCount: result.findings.length
        }
      ],
      findings: result.findings,
      logs: [`[RAW] Parsed ${rawLog.split('\n').length} lines of text`, `[AI] Extracted ${result.findings.length} findings`],
      authorized: true,
      summary: {
        critical: result.findings.filter(f => f.severity === 'Critical').length,
        high: result.findings.filter(f => f.severity === 'High').length,
        medium: result.findings.filter(f => f.severity === 'Medium').length,
        low: result.findings.filter(f => f.severity === 'Low').length,
        info: result.findings.filter(f => f.severity === 'Informational').length,
        total: result.findings.length
      }
    };
    db.saveScan(rawScan);

    res.json({
      ...result,
      scanId: rawScan.id
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Tools Catalog
apiRouter.get('/tools', (req: Request, res: Response) => {
  res.json(db.getAllTools());
});

// 10. Audit Logs
apiRouter.get('/audit-logs', (req: Request, res: Response) => {
  res.json(db.getAuditLogs());
});
