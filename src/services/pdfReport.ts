import { jsPDF } from 'jspdf';
import { VaptReport } from '../types';

export function generatePdfReport(report: VaptReport) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor = [15, 23, 42]; // Slate 900
  const accentColor = [37, 99, 235]; // Blue 600
  const textColor = [51, 65, 85]; // Slate 700
  const lightBg = [248, 250, 252]; // Slate 50

  let y = 20;

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('AEGIS-AI SECURITY ASSURANCE', 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('CONFIDENTIAL VULNERABILITY ASSESSMENT & PENETRATION TESTING REPORT', 14, 23);
  doc.text(`Generated: ${new Date(report.generatedAt).toLocaleDateString()}`, 150, 23);

  y = 42;

  // Title Box
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(report.title, 14, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Target Asset: ${report.target} | Target Type: ${report.scope.targetType.toUpperCase()}`, 14, y);
  y += 12;

  // Executive Summary Card
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, y, 182, 38, 2, 2, 'F');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('EXECUTIVE SUMMARY & SECURITY SCORE', 18, y + 8);

  // Security Score Badge
  doc.setFillColor(report.securityScore >= 80 ? 34 : report.securityScore >= 60 ? 234 : 225, report.securityScore >= 80 ? 197 : report.securityScore >= 60 ? 179 : 29, report.securityScore >= 80 ? 94 : report.securityScore >= 60 ? 8 : 72);
  doc.roundedRect(148, y + 4, 42, 14, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Score: ${report.securityScore}/100`, 154, y + 13);

  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const splitSummary = doc.splitTextToSize(report.executiveSummary, 174);
  doc.text(splitSummary, 18, y + 17);

  y += 46;

  // Findings Breakdown Metrics
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('FINDINGS SEVERITY OVERVIEW', 14, y);
  y += 6;

  const boxWidth = 34;
  const metrics = [
    { label: 'Critical', count: report.summary.critical, color: [225, 29, 72] },
    { label: 'High', count: report.summary.high, color: [234, 88, 12] },
    { label: 'Medium', count: report.summary.medium, color: [217, 119, 6] },
    { label: 'Low', count: report.summary.low, color: [37, 99, 235] },
    { label: 'Info', count: report.summary.info, color: [100, 116, 139] }
  ];

  metrics.forEach((m, idx) => {
    const xPos = 14 + idx * (boxWidth + 3);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(xPos, y, boxWidth, 18, 1, 1, 'F');

    doc.setFillColor(m.color[0], m.color[1], m.color[2]);
    doc.circle(xPos + 6, y + 7, 2, 'F');

    doc.setTextColor(m.color[0], m.color[1], m.color[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(String(m.count), xPos + 11, y + 9);

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(m.label, xPos + 5, y + 15);
  });

  y += 28;

  // Detailed Findings Table
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('KEY VULNERABILITIES & REMEDIATION', 14, y);
  y += 7;

  report.findings.forEach((finding, idx) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, 182, 36, 1, 1, 'FD');

    // Severity pill
    const sevColor = finding.severity === 'Critical' ? [225, 29, 72]
      : finding.severity === 'High' ? [234, 88, 12]
      : finding.severity === 'Medium' ? [217, 119, 6]
      : [37, 99, 235];

    doc.setFillColor(sevColor[0], sevColor[1], sevColor[2]);
    doc.roundedRect(18, y + 4, 20, 5, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(finding.severity.toUpperCase(), 20, y + 7.5);

    // Title
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(`${idx + 1}. ${finding.title}`, 42, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`CVSS: ${finding.cvss} | Tool: ${finding.tool} | Asset: ${finding.affectedAsset}`, 18, y + 14);

    doc.setTextColor(51, 65, 85);
    const desc = doc.splitTextToSize(`Description: ${finding.description}`, 174);
    doc.text(desc.slice(0, 2), 18, y + 19);

    doc.setTextColor(30, 64, 175);
    const rem = doc.splitTextToSize(`Remediation: ${finding.remediation}`, 174);
    doc.text(rem.slice(0, 2), 18, y + 27);

    y += 40;
  });

  // Footer on last page
  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  y += 5;
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text('This automated security report was generated by Aegis-AI VAPT Security Copilot.', 14, 285);
  doc.text('CONFIDENTIAL - AUTHORIZED ACCESS ONLY', 140, 285);

  doc.save(`VAPT-Report-${report.target.replace(/[^a-zA-Z0-9]/g, '_')}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
