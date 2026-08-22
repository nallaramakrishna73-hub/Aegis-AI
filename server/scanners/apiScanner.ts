import { SecurityFinding } from '../../src/types';

export interface ApiScanResult {
  target: string;
  endpointsFound: string[];
  supportedMethods: string[];
  findings: SecurityFinding[];
  logs: string[];
}

export async function scanApiSecurity(targetUrl: string): Promise<ApiScanResult> {
  const logs: string[] = [];
  const findings: SecurityFinding[] = [];
  const endpointsFound: string[] = [];
  const supportedMethods: string[] = [];

  let baseUrl = targetUrl;
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    baseUrl = 'https://' + baseUrl;
  }
  baseUrl = baseUrl.replace(/\/+$/, '');

  logs.push(`[API] Beginning API Security Audit on ${baseUrl}`);

  const apiDocPaths = [
    '/swagger.json',
    '/swagger/v1/swagger.json',
    '/openapi.json',
    '/api-docs',
    '/v2/api-docs',
    '/api/v1/health',
    '/api/health',
    '/graphql'
  ];

  for (const path of apiDocPaths) {
    const probeUrl = `${baseUrl}${path}`;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      const resp = await fetch(probeUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json, text/html' },
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (resp.status === 200) {
        endpointsFound.push(path);
        logs.push(`[API DISCOVERY] Found API resource: ${path} (HTTP 200)`);

        if (path.includes('swagger') || path.includes('openapi')) {
          logs.push('[WARN] Publicly exposed Swagger/OpenAPI documentation schema');
          findings.push({
            id: `FIND-APIDOC-${Date.now()}`,
            title: 'Exposed Swagger / OpenAPI Documentation Endpoint',
            severity: 'Low',
            cvss: 3.7,
            cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N',
            confidence: 0.98,
            affectedAsset: probeUrl,
            description: `The API definition schema at \`${path}\` is publicly accessible without authentication. This gives adversaries full introspection of internal routes, parameters, data models, and authentication logic.`,
            evidence: `GET ${probeUrl} returned HTTP 200 API Schema`,
            impact: 'Facilitates targeted parameter fuzzing and rapid zero-day vulnerability identification.',
            remediation: 'Restrict access to API documentation to authenticated developers or internal subnets in production environments.',
            references: [
              'https://owasp.org/www-project-api-security/'
            ],
            tool: 'API Security Analyzer',
            cwe: 'CWE-200',
            timestamp: new Date().toISOString()
          });
        }
      }
    } catch (e) {
      // Ignored
    }
  }

  // Probe OPTIONS request for allowed HTTP methods
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const optionsResp = await fetch(baseUrl, {
      method: 'OPTIONS',
      signal: controller.signal
    });
    clearTimeout(timeout);

    const allowHeader = optionsResp.headers.get('allow');
    if (allowHeader) {
      supportedMethods.push(...allowHeader.split(',').map(m => m.trim()));
      logs.push(`[API] Server allows HTTP methods: ${supportedMethods.join(', ')}`);

      if (supportedMethods.includes('TRACE') || supportedMethods.includes('TRACK')) {
        findings.push({
          id: `FIND-HTTP-TRACE-${Date.now()}`,
          title: 'Insecure HTTP TRACE / TRACK Method Enabled',
          severity: 'Medium',
          cvss: 5.3,
          cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N',
          confidence: 0.99,
          affectedAsset: baseUrl,
          description: 'The web server supports HTTP TRACE/TRACK method, which echoes back client requests including authentication cookies and headers (Cross-Site Tracing / XST).',
          evidence: `Allow Header: ${allowHeader}`,
          impact: 'Attackers can bypass HttpOnly cookie protections using Cross-Site Tracing (XST).',
          remediation: 'Disable TRACE and TRACK methods in web server configuration.',
          remediationCode: [
            {
              language: 'apache',
              filename: 'httpd.conf',
              snippet: 'TraceEnable Off'
            }
          ],
          references: ['https://owasp.org/www-community/attacks/Cross_Site_Tracing'],
          tool: 'API Security Analyzer',
          cwe: 'CWE-200',
          timestamp: new Date().toISOString()
        });
      }
    }
  } catch (e) {
    // Fallback
    supportedMethods.push('GET', 'POST', 'OPTIONS');
  }

  logs.push(`[API] API Security scan completed. Discovered ${endpointsFound.length} endpoints.`);
  return {
    target: baseUrl,
    endpointsFound,
    supportedMethods,
    findings,
    logs
  };
}
