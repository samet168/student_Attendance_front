import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportToPdfFile(
  title: string,
  headers: string[],
  rows: (string | number)[][],
  filename: string = 'report.pdf'
) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 30,
    theme: 'grid',
    headStyles: { fillColor: [30, 58, 138] },
  });

  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}
