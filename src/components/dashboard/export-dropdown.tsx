'use client';

import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType } from 'docx';
import pptxgen from 'pptxgenjs';
import { 
  FileArrowDown, FileXls, FilePdf, FileDoc, Presentation, CaretDown 
} from '@phosphor-icons/react';
import { useUIStore } from '@/stores/use-ui-store';

interface ExportDropdownProps {
  data: any[];
  filename?: string;
  title?: string;
  classNameTitle?: string;
}

export function ExportDropdown({ data, filename = 'export', title = 'Data Export', classNameTitle }: ExportDropdownProps) {
  const displayTitle = classNameTitle || title;
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { language } = useUIStore();
  const isKm = language === 'km';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. Export Excel
  const exportToExcel = () => {
    const cleanData = data.map((item) => {
      const { id, avatar_url, ...rest } = item;
      return rest;
    });
    const worksheet = XLSX.utils.json_to_sheet(cleanData.length ? cleanData : [{ info: 'No data' }]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
    setIsOpen(false);
  };

  // 2. Export PDF
  const exportToPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(displayTitle, 14, 15);
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 22);

    if (data.length > 0) {
      const keys = Object.keys(data[0]).filter((k) => k !== 'avatar_url');
      const tableRows = data.map((item) => keys.map((k) => String(item[k] ?? '')));

      autoTable(doc, {
        head: [keys.map((k) => k.replace(/_/g, ' ').toUpperCase())],
        body: tableRows,
        startY: 28,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 8 },
      });
    }

    doc.save(`${filename}.pdf`);
    setIsOpen(false);
  };

  // 3. Export Word (.docx)
  const exportToWord = async () => {
    if (!data.length) {
      setIsOpen(false);
      return;
    }

    const keys = Object.keys(data[0]).filter((k) => k !== 'avatar_url');
    const headerRow = new TableRow({
      children: keys.map((k) => new TableCell({ children: [new Paragraph(k.toUpperCase())] })),
    });

    const dataRows = data.map(
      (item) =>
        new TableRow({
          children: keys.map((k) => new TableCell({ children: [new Paragraph(String(item[k] ?? ''))] })),
        })
    );

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({ text: displayTitle, heading: 'Heading1' }),
            new Table({
              rows: [headerRow, ...dataRows],
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
    link.download = `${filename}.docx`;
    link.click();
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  // 4. Export PowerPoint (.pptx)
  const exportToPptx = () => {
    const pptx = new pptxgen();
    const slide = pptx.addSlide();

    slide.addText(displayTitle, {
      x: 0.5,
      y: 0.5,
      fontSize: 20,
      bold: true,
      color: '2563EB',
    });

    if (data.length > 0) {
      const keys = Object.keys(data[0]).filter((k) => k !== 'avatar_url').slice(0, 6);
      const headers = keys.map((k) => ({
        text: k.replace(/_/g, ' ').toUpperCase(),
        options: { bold: true, fill: { color: '2563EB' }, color: 'FFFFFF' },
      }));

      const rows = data.slice(0, 12).map((item) =>
        keys.map((k) => ({
          text: String(item[k] ?? ''),
        }))
      );

      slide.addTable([headers, ...rows] as any, { x: 0.5, y: 1.2, w: 9.0, autoPage: true });
    }

    pptx.writeFile({ fileName: `${filename}.pptx` });
    setIsOpen(false);
  };

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition cursor-pointer shadow-xs"
      >
        <FileArrowDown size={16} className="text-blue-600" />
        <span>{isKm ? 'ទាញយក' : 'Export'}</span>
        <CaretDown size={12} className="text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <button
            onClick={exportToExcel}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition text-left cursor-pointer"
          >
            <FileXls size={18} className="text-emerald-600" weight="fill" />
            <span>Excel Spreadsheet (.xlsx)</span>
          </button>
          <button
            onClick={exportToPdf}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition text-left cursor-pointer"
          >
            <FilePdf size={18} className="text-rose-600" weight="fill" />
            <span>PDF Document (.pdf)</span>
          </button>
          <button
            onClick={exportToWord}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition text-left cursor-pointer"
          >
            <FileDoc size={18} className="text-blue-600" weight="fill" />
            <span>Word Document (.docx)</span>
          </button>
          <button
            onClick={exportToPptx}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition text-left cursor-pointer"
          >
            <Presentation size={18} className="text-amber-600" weight="fill" />
            <span>PowerPoint (.pptx)</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default ExportDropdown;
