import {
  formatCharacterLabel,
  formatTokenEstimateLabel,
  getEstimatedTokenCount,
} from '@/shared/text-stats';
import { formatSummaryRow, type SummaryStyleOptions } from '@/shared/summary-style';
import { stripAnsi } from './strip-ansi';

export function formatOutputContextSummary(
  output: string,
  options: SummaryStyleOptions = {}
): string {
  const visibleOutput = stripAnsi(output);
  const characterCount = visibleOutput.length;
  const row = `command output: ${formatCharacterLabel(characterCount)}, ${formatTokenEstimateLabel(getEstimatedTokenCount(characterCount))}`;

  return [
    'output context',
    `└── ${formatSummaryRow(row, options)}`,
  ].join('\n');
}
