import pptxgen from 'pptxgenjs';

export function exportToPptxFile(
  title: string,
  headers: string[],
  rows: (string | number)[][],
  filename: string = 'presentation.pptx'
) {
  const pptx = new pptxgen();
  const slide = pptx.addSlide();

  slide.addText(title, {
    x: 0.5,
    y: 0.5,
    fontSize: 20,
    bold: true,
    color: '1E3A8A',
  });

  const headerRow = headers.map((h) => ({
    text: h,
    options: { bold: true, fill: { color: '1E3A8A' }, color: 'FFFFFF' },
  }));

  const dataRows = rows.slice(0, 15).map((r) => r.map((c) => ({ text: String(c) })));

  const tableData = [headerRow, ...dataRows];
  slide.addTable(tableData as any, { x: 0.5, y: 1.2, w: 9.0, autoPage: true });

  pptx.writeFile({ fileName: filename.endsWith('.pptx') ? filename : `${filename}.pptx` });
}
