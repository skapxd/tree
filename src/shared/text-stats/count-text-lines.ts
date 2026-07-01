export function countTextLines(content: string): number {
  const isEmptyContent = content.length === 0;
  if (isEmptyContent) return 0;

  return content.endsWith('\n') ? content.split('\n').length - 1 : content.split('\n').length;
}
