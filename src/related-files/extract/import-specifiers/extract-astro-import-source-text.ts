import { findScriptCloseTag } from './extract-astro-import-source-text/find-script-close-tag';
import { findTagEnd } from './extract-astro-import-source-text/find-tag-end';
import { isScriptTagBoundary } from './extract-astro-import-source-text/is-script-tag-boundary';
import { shouldParseAstroScript } from './extract-astro-import-source-text/should-parse-astro-script';

const ASTRO_FRONTMATTER_REGEX = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;
const SCRIPT_OPEN_TAG = '<script';

export function extractAstroImportSourceText(content: string): string {
  const sourceTextSections: string[] = [];
  const frontmatterMatch = content.match(ASTRO_FRONTMATTER_REGEX);
  const frontmatterSourceText = frontmatterMatch?.[1];
  if (frontmatterSourceText !== undefined) {
    sourceTextSections.push(frontmatterSourceText);
  }

  const lowerContent = content.toLowerCase();
  let searchIndex = 0;
  while (searchIndex < content.length) {
    const openStart = lowerContent.indexOf(SCRIPT_OPEN_TAG, searchIndex);
    const lacksOpenStart = openStart < 0;
    if (lacksOpenStart) break;

    const attrsStart = openStart + SCRIPT_OPEN_TAG.length;
    const hasScriptBoundary = isScriptTagBoundary(lowerContent[attrsStart]);
    if (!hasScriptBoundary) {
      searchIndex = attrsStart;
      continue;
    }

    const openEnd = findTagEnd(content, attrsStart);
    const lacksOpenEnd = openEnd < 0;
    if (lacksOpenEnd) break;

    const closeTag = findScriptCloseTag(content, lowerContent, openEnd + 1);
    const lacksCloseTag = closeTag === null;
    if (lacksCloseTag) {
      searchIndex = openEnd + 1;
      continue;
    }

    const attrs = content.slice(attrsStart, openEnd);
    const scriptSourceText = content.slice(openEnd + 1, closeTag.start);
    const shouldParseScript = shouldParseAstroScript(attrs);
    if (shouldParseScript) {
      sourceTextSections.push(scriptSourceText);
    }

    searchIndex = closeTag.end;
  }

  return sourceTextSections.join('\n;\n');
}
