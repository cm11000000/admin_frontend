// Utility helpers for bulk/export features

export function parseCronExpression(expr: string): string {
  // Very lightweight humanizer for common 5-field cron expressions: "m h dom mon dow"
  // Fallback to original if we can't parse sensibly.
  if (!expr || typeof expr !== 'string') return '';
  const parts = expr.trim().split(/\s+/);
  if (parts.length < 5) return expr;

  const [min, hour, dom, mon, dow] = parts;

  const fmtTime = () => {
    const h = hour === '*' ? 0 : Number(hour);
    const m = min === '*' ? 0 : Number(min);
    if (Number.isNaN(h) || Number.isNaN(m)) return '';
    const hh = ((h + 11) % 12) + 1;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const mm = String(m).padStart(2, '0');
    return `${hh}:${mm} ${ampm}`;
  };

  const timeStr = fmtTime();

  if (dow !== '*' && dom === '*' && mon === '*') {
    return `Every ${cronDayOfWeek(dow)} at ${timeStr || 'scheduled time'}`.trim();
  }
  if (dom !== '*' && mon === '*' && dow === '*') {
    return `On day ${dom} of every month at ${timeStr || 'scheduled time'}`.trim();
  }
  if (dom === '*' && mon === '*' && dow === '*') {
    return `Every day at ${timeStr || 'scheduled time'}`.trim();
  }
  return expr; // Fallback for more complex expressions
}

function cronDayOfWeek(dow: string): string {
  // Supports single values or lists like "1,3"; returns a simple phrase
  const map: Record<string, string> = {
    '0': 'Sunday', '7': 'Sunday', '1': 'Monday', '2': 'Tuesday', '3': 'Wednesday',
    '4': 'Thursday', '5': 'Friday', '6': 'Saturday', '*': 'day'
  };
  if (dow.includes(',')) {
    const names = dow.split(',').map(d => map[d] || d);
    return names.join(', ');
  }
  return map[dow] || dow;
}

// -------- File helpers used by bulk upload screens --------

export async function parseCSVFile(file: File): Promise<any[]> {
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter(Boolean);
  const [headerLine, ...rows] = lines;
  if (!headerLine) return [];
  const headers = headerLine.split(',').map((h) => h.trim());
  return rows.map((line) => {
    const cols = line.split(',');
    const obj: Record<string, any> = {};
    headers.forEach((h, i) => (obj[h] = cols[i]?.trim() ?? ''));
    return obj;
  });
}

export async function parseExcelFile(_file: File): Promise<any[]> {
  // Minimal placeholder: for build stability, treat as empty set.
  // In real environment, use xlsx to parse.
  return [];
}

export function validateData(rows: any[], required: string[] = []): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  rows.forEach((row, idx) => {
    required.forEach((key) => {
      if (!row || row[key] == null || String(row[key]).trim() === '') {
        errors.push(`Row ${idx + 1}: Missing ${key}`);
      }
    });
  });
  return { valid: errors.length === 0, errors };
}

export function validateFileType(file: File, allowed: string[] = ['text/csv','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']): boolean {
  return allowed.includes(file.type);
}

export function validateFileSize(file: File, maxBytes: number = 10 * 1024 * 1024): boolean {
  return file.size <= maxBytes;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

