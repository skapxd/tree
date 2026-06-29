import {
  ANSI_DIM,
  ANSI_RESET,
} from '@/related-files/constants';
import { type RelatedFormatOptions } from '@/related-files/types';
import { formatLineCount } from './format-line-count';

export function formatLineCountSuffix(
  lineCount: number,
  options: RelatedFormatOptions = {}
): string {
  const suffix = `(${formatLineCount(lineCount)})`;
  return options.color ? `${ANSI_DIM}${suffix}${ANSI_RESET}` : suffix;
}
