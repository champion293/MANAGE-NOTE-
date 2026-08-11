export interface TotalEntry {
  value: number;
  raw: string;
  lineIndex: number;
}

export interface TotalItem {
  label: string;
  total: number;
  count: number;
  entries: TotalEntry[];
}

// Requires at least one space between the name and the amount.
// \p{L}\p{M} covers Latin, Devanagari (Hindi) and Arabic (Urdu) letters.
const LINE_PATTERN =
  /^([\p{L}\p{M}][\p{L}\p{M}\s.,'’-]*?)[\s:-=]+([0-9]+(?:\.[0-9]+)?)\s*(?:rs\.?|rupees?|rupaye|rupya|₹|\/-)?\s*$/iu;

export function parseTotals(text: string): TotalItem[] {
  const lines = text.split(/\r?\n/);

  const totals = new Map<string, TotalItem>();

  lines.forEach((line, lineIndex) => {
    const match = line.trim().match(LINE_PATTERN);

    if (!match) return;

    const label = match[1].trim();
    const value = Number(match[2]);

    if (!label || Number.isNaN(value)) return;

    const existing = totals.get(label);

    const entry: TotalEntry = {
      value,
      raw: line,
      lineIndex,
    };

    if (existing) {
      existing.total += value;
      existing.count += 1;
      existing.entries.push(entry);
    } else {
      totals.set(label, {
        label,
        total: value,
        count: 1,
        entries: [entry],
      });
    }
  });

  return Array.from(totals.values());
}
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}