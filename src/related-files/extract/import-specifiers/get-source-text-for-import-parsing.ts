import path from 'node:path';
import { extractAstroImportSourceText } from './extract-astro-import-source-text';

export function getSourceTextForImportParsing(filePath: string, content: string): string {
  const isAstroFile = path.extname(filePath).toLowerCase() === '.astro';
  if (!isAstroFile) return content;

  return extractAstroImportSourceText(content);
}
