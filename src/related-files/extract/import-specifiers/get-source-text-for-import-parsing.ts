import path from 'node:path';

export function getSourceTextForImportParsing(filePath: string, content: string): string {
  const isAstroFile = path.extname(filePath).toLowerCase() === '.astro';
  if (!isAstroFile) return content;

  const frontmatterMatch = content.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/);
  return frontmatterMatch?.[1] ?? '';
}
