export function getMarkdownFenceMarker(line: string): string | null {
  const fenceMatch = line.match(/^\s{0,3}(```+|~~~+)/);
  return fenceMatch?.[1] ?? null;
}
