import { colorSummaryValue } from './color-summary-value';
import { type SummaryStyleOptions } from './types';

export function formatSummaryRow(row: string, options: SummaryStyleOptions = {}): string {
  const separatorIndex = row.indexOf(': ');
  const lacksSeparator = separatorIndex === -1;
  if (lacksSeparator) return row;

  const label = row.slice(0, separatorIndex);
  const value = row.slice(separatorIndex + 2);

  return `${label}: ${colorSummaryValue(value, options.color === true)}`;
}
