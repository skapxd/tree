import { formatSummaryRow, type SummaryStyleOptions } from '@/shared/summary-style';

export function appendFlatRows(
  lines: string[],
  rows: string[],
  hasSections: boolean,
  options: SummaryStyleOptions = {}
): void {
  rows.forEach((row, index) => {
    const isLast = !hasSections && index === rows.length - 1;
    lines.push(`${isLast ? '└──' : '├──'} ${formatSummaryRow(row, options)}`);
  });
}
