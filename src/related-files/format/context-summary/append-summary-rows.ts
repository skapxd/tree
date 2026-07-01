import { formatSummaryRow, type SummaryStyleOptions } from '@/shared/summary-style';

export function appendSummaryRows(
  lines: string[],
  rows: string[],
  hasLargestFiles: boolean,
  options: SummaryStyleOptions = {}
): void {
  rows.forEach((row, index) => {
    const isLast = !hasLargestFiles && index === rows.length - 1;
    lines.push(`${isLast ? '└──' : '├──'} ${formatSummaryRow(row, options)}`);
  });
}
