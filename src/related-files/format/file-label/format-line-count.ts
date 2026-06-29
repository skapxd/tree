export function formatLineCount(lineCount: number): string {
  return `${lineCount} ${lineCount === 1 ? 'line' : 'lines'}`;
}
