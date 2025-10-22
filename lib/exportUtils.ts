/**
 * Export Utilities for Reports
 * Handles CSV, Excel, and PDF exports
 */

// Heavy libs are loaded on demand to keep initial bundle small
// XLSX and jsPDF will be imported within the export functions
import { format } from 'date-fns';

// ============= CSV Export =============

export function exportToCSV(data: any[], filename: string, columns?: string[]) {
  try {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    const headers = columns || Object.keys(data[0]);
    const csvRows = [];

    csvRows.push(headers.join(','));

    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        const escaped = ('' + value).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: true, filename: `${filename}.csv` };
  } catch (error) {
    throw new Error(`CSV export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============= Excel Export =============

export async function exportToExcel(data: any[], filename: string, options?: {
  sheetName?: string;
  columns?: string[];
  includeMetadata?: boolean;
  metadata?: Record<string, any>;
}) {
  try {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    const sheetName = options?.sheetName || 'Report';

    let worksheetData: any[] = [];

    if (options?.includeMetadata && options?.metadata) {
      worksheetData.push(['Report Metadata']);
      worksheetData.push([]);
      Object.entries(options.metadata).forEach(([key, value]) => {
        worksheetData.push([key, value]);
      });
      worksheetData.push([]);
      worksheetData.push([]);
    }

    const filteredData = options?.columns
      ? data.map(row => {
          const filtered: any = {};
          options.columns?.forEach(col => {
            filtered[col] = row[col];
          });
          return filtered;
        })
      : data;

    const ws = XLSX.utils.json_to_sheet(filteredData, {
      origin: worksheetData.length > 0 ? `A${worksheetData.length + 1}` : 'A1',
    });

    if (worksheetData.length > 0) {
      XLSX.utils.sheet_add_aoa(ws, worksheetData, { origin: 'A1' });
    }

    const colWidths = Object.keys(filteredData[0] || {}).map(key => ({
      wch: Math.max(key.length, 15),
    }));
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    XLSX.writeFile(wb, `${filename}.xlsx`);

    return { success: true, filename: `${filename}.xlsx` };
  } catch (error) {
    throw new Error(`Excel export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============= PDF Export =============

export async function exportToPDF(data: any[], filename: string, options?: {
  title?: string;
  columns?: { header: string; dataKey: string }[];
  orientation?: 'portrait' | 'landscape';
  includeMetadata?: boolean;
  metadata?: Record<string, any>;
  summary?: { label: string; value: string }[];
}) {
  try {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF({
      orientation: options?.orientation || 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(options?.title || 'Report', margin, 20);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${format(new Date(), 'PPpp')}`, margin, 28);

    let yPos = 35;

    if (options?.includeMetadata && options?.metadata) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Report Details', margin, yPos);
      yPos += 7;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      Object.entries(options.metadata).forEach(([key, value]) => {
        doc.text(`${key}: ${value}`, margin, yPos);
        yPos += 5;
      });
      yPos += 5;
    }

    if (options?.summary && options.summary.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary', margin, yPos);
      yPos += 7;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      options.summary.forEach(item => {
        doc.text(`${item.label}: ${item.value}`, margin, yPos);
        yPos += 5;
      });
      yPos += 5;
    }

    const columns = options?.columns || Object.keys(data[0]).map(key => ({
      header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
      dataKey: key,
    }));

    const tableData = data.map(row =>
      columns.map(col => {
        const value = row[col.dataKey];
        if (value === null || value === undefined) return '-';
        if (typeof value === 'number') {
          return col.dataKey.includes('amount') || col.dataKey.includes('price')
            ? `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
            : value.toLocaleString();
        }
        return String(value);
      })
    );

    autoTable(doc, {
      head: [columns.map(col => col.header)],
      body: tableData,
      startY: yPos,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [255, 127, 0],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
      didDrawPage: (data) => {
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.text(
          `Page ${pageCount}`,
          pageWidth - margin - 20,
          pageHeight - 10
        );
      },
    });

    doc.save(`${filename}.pdf`);

    return { success: true, filename: `${filename}.pdf` };
  } catch (error) {
    throw new Error(`PDF export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============= Multi-Sheet Excel Export =============

export function exportToExcelMultiSheet(
  sheets: Array<{
    name: string;
    data: any[];
    columns?: string[];
  }>,
  filename: string,
  options?: {
    includeMetadata?: boolean;
    metadata?: Record<string, any>;
  }
) {
  try {
    const wb = XLSX.utils.book_new();

    sheets.forEach((sheet, index) => {
      if (!sheet.data || sheet.data.length === 0) {
        return;
      }

      let worksheetData: any[] = [];

      if (index === 0 && options?.includeMetadata && options?.metadata) {
        worksheetData.push(['Report Metadata']);
        worksheetData.push([]);
        Object.entries(options.metadata).forEach(([key, value]) => {
          worksheetData.push([key, value]);
        });
        worksheetData.push([]);
        worksheetData.push([]);
      }

      const filteredData = sheet.columns
        ? sheet.data.map(row => {
            const filtered: any = {};
            sheet.columns?.forEach(col => {
              filtered[col] = row[col];
            });
            return filtered;
          })
        : sheet.data;

      const ws = XLSX.utils.json_to_sheet(filteredData, {
        origin: worksheetData.length > 0 ? `A${worksheetData.length + 1}` : 'A1',
      });

      if (worksheetData.length > 0) {
        XLSX.utils.sheet_add_aoa(ws, worksheetData, { origin: 'A1' });
      }

      const colWidths = Object.keys(filteredData[0] || {}).map(key => ({
        wch: Math.max(key.length, 15),
      }));
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, sheet.name);
    });

    XLSX.writeFile(wb, `${filename}.xlsx`);

    return { success: true, filename: `${filename}.xlsx` };
  } catch (error) {
    throw new Error(`Excel export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============= Format Helpers =============

export function formatCurrency(value: number): string {
  return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-IN');
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'dd MMM yyyy');
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'dd MMM yyyy, HH:mm');
}

// ============= Data Transformation Helpers =============

export function transformForExport(data: any[], transformations?: Record<string, (value: any) => any>): any[] {
  if (!transformations) return data;

  return data.map(row => {
    const transformed: any = { ...row };
    Object.entries(transformations).forEach(([key, transformer]) => {
      if (key in transformed) {
        transformed[key] = transformer(transformed[key]);
      }
    });
    return transformed;
  });
}

export function flattenNestedData(data: any[], prefix: string = ''): any[] {
  return data.map(item => {
    const flattened: any = {};

    Object.entries(item).forEach(([key, value]) => {
      const newKey = prefix ? `${prefix}_${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        Object.entries(value).forEach(([nestedKey, nestedValue]) => {
          flattened[`${newKey}_${nestedKey}`] = nestedValue;
        });
      } else {
        flattened[newKey] = value;
      }
    });

    return flattened;
  });
}
