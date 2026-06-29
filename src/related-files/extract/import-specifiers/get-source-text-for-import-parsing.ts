import path from 'node:path';

export function getSourceTextForImportParsing(filePath: string, content: string): string {
  const isAstroFile = path.extname(filePath).toLowerCase() === '.astro';
  if (!isAstroFile) return content;

  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\n---/);
  return frontmatterMatch?.[1] ?? '';
}
