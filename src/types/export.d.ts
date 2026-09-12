export type ExportFormat = 'xlsx' | 'pdf' | 'docx' | 'pptx';

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

export interface ExportOptions {
  filename?: string;
  title?: string;
  columns: ExportColumn[];
  data: Record<string, any>[];
}
