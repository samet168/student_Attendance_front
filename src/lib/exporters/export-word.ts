import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, TextRun } from 'docx';

export async function exportToWordFile(
  title: string,
  headers: string[],
  rows: (string | number)[][],
  filename: string = 'document.docx'
) {
  const tableRows = [
    new TableRow({
      children: headers.map((h) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })] })),
    }),
    ...rows.map(
      (row) =>
        new TableRow({
          children: row.map((cell) => new TableCell({ children: [new Paragraph(String(cell))] })),
        })
    ),
  ];

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: title, heading: 'Heading1' }),
          new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.docx') ? filename : `${filename}.docx`;
  link.click();
  URL.revokeObjectURL(url);
}
