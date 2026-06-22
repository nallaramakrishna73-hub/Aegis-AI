import PDFDocument from 'pdfkit';
import * as docx from 'docx';
import fs from 'fs';
import { ThreatRecord } from '../models/threat.js';

const { Document, Packer, Paragraph, TextRun } = docx as typeof docx & {
  Document: any;
  Packer: any;
  Paragraph: any;
  TextRun: any;
};

export class ReportService {
  async generatePdf(threats: ThreatRecord[], filePath: string) {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    doc.fontSize(18).text('Aegis-AI Incident Report', { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Generated at ${new Date().toISOString()}`);
    doc.moveDown();

    await new Promise<void>((resolve, reject) => {
      stream.on('finish', () => resolve());
      stream.on('error', (error) => reject(error));
      threats.forEach((threat) => {
        doc.fontSize(14).text(threat.type.toUpperCase());
        doc.fontSize(12).text(`Source IP: ${threat.sourceIp}`);
        doc.text(`Risk Level: ${threat.risk}`);
        doc.text(`Status: ${threat.status}`);
        doc.text(`Description: ${threat.description}`);
        doc.text(`Recommendations: ${threat.recommendations.join(', ')}`);
        doc.moveDown();
      });
      doc.end();
    });
  }

  async generateDocx(threats: ThreatRecord[], filePath: string) {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'Aegis-AI Incident Report', bold: true, size: 32 })],
            }),
            new Paragraph({ text: `Generated at ${new Date().toISOString()}` }),
            ...threats.flatMap((threat) => [
              new Paragraph({ text: '' }),
              new Paragraph({ children: [new TextRun({ text: threat.type.toUpperCase(), bold: true })] }),
              new Paragraph({ text: `Source IP: ${threat.sourceIp}` }),
              new Paragraph({ text: `Risk Level: ${threat.risk}` }),
              new Paragraph({ text: `Status: ${threat.status}` }),
              new Paragraph({ text: `Description: ${threat.description}` }),
              new Paragraph({ text: `Recommendations: ${threat.recommendations.join(', ')}` }),
            ]),
          ],
        },
      ],
    });
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(filePath, buffer);
  }
}
