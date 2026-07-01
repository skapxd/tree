export function getMaxLineLength(content: string): number {
  return content.split('\n').reduce((maxLength, line) => Math.max(maxLength, line.length), 0);
}
