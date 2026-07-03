export function getVisibleFullHeading(
  lines: string[],
  startLine: number,
  title: string
): string {
  const line = lines[startLine - 1]?.trim();
  const lacksLine = line === undefined || line.length === 0;
  return lacksLine ? title : line;
}
