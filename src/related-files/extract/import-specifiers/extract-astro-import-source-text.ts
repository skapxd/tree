import { shouldParseAstroScript } from './extract-astro-import-source-text/should-parse-astro-script';

const ASTRO_FRONTMATTER_REGEX = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;
const ASTRO_SCRIPT_REGEX = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

export function extractAstroImportSourceText(content: string): string {
  const sourceTextSections: string[] = [];
  const frontmatterMatch = content.match(ASTRO_FRONTMATTER_REGEX);
  const frontmatterSourceText = frontmatterMatch?.[1];
  if (frontmatterSourceText !== undefined) {
    sourceTextSections.push(frontmatterSourceText);
  }

  let scriptMatch: RegExpExecArray | null;
  while ((scriptMatch = ASTRO_SCRIPT_REGEX.exec(content)) !== null) {
    const attrs = scriptMatch[1] ?? '';
    const scriptSourceText = scriptMatch[2] ?? '';
    const shouldParseScript = shouldParseAstroScript(attrs);
    if (shouldParseScript) {
      sourceTextSections.push(scriptSourceText);
    }
  }

  return sourceTextSections.join('\n;\n');
}
