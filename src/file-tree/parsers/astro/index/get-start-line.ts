export function getStartLine(content: string, totalIndex: number): number {
  return content.slice(0, totalIndex).split(/\r\n|\r|\n/).length;
}
