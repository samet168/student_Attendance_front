import { exportToExcelFile } from '@/lib/exporters/export-excel';
import { exportToPdfFile } from '@/lib/exporters/export-pdf';
import { exportToWordFile } from '@/lib/exporters/export-word';
import { exportToPptxFile } from '@/lib/exporters/export-pptx';

export function useExportData() {
  const exportExcel = (data: any[], filename?: string) => {
    exportToExcelFile(data, filename);
  };

  const exportPdf = (title: string, headers: string[], rows: (string | number)[][], filename?: string) => {
    exportToPdfFile(title, headers, rows, filename);
  };

  const exportWord = (title: string, headers: string[], rows: (string | number)[][], filename?: string) => {
    exportToWordFile(title, headers, rows, filename);
  };

  const exportPptx = (title: string, headers: string[], rows: (string | number)[][], filename?: string) => {
    exportToPptxFile(title, headers, rows, filename);
  };

  return {
    exportExcel,
    exportPdf,
    exportWord,
    exportPptx,
  };
}
