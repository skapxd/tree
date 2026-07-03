import {
  COL_LINES_WIDTH,
  COL_TYPE_WIDTH,
  SYMBOL_SEPARATOR_WIDTH,
} from './constants';

export function formatHeader(): string[] {
  const linesHeader = 'Lines'.padStart(COL_LINES_WIDTH);
  const typeHeader = 'Type'.padEnd(COL_TYPE_WIDTH);
  const symbolHeader = ' Symbol';

  return [
    '',
    `${linesHeader} │ ${typeHeader} │${symbolHeader}`,
    `${'─'.repeat(COL_LINES_WIDTH + 1)}┼${'─'.repeat(COL_TYPE_WIDTH + 2)}┼${'─'.repeat(SYMBOL_SEPARATOR_WIDTH)}`,
  ];
}
