export function cleanMarkdownTitle(title: string): string {
  return title
    .replace(/\s+#+\s*$/g, '')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}
