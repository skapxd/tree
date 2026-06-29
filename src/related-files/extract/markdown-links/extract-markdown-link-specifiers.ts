import { type ExtractedSpecifier } from '@/related-files/types';
import { addMarkdownSpecifier } from './add-markdown-specifier';
import { isInsideMarkdownCodeSpan } from './is-inside-markdown-code-span';
import { stripMarkdownFencedCode } from './strip-markdown-fenced-code';

export function extractMarkdownLinkSpecifiers(content: string): ExtractedSpecifier[] {
  const linkableContent = stripMarkdownFencedCode(content);
  const specifiers: ExtractedSpecifier[] = [];
  const inlineLinkRegex = /(^|[^!])\[([^\]]+)]\(([^)]+)\)/g;
  const referenceDefinitionRegex = /^\s{0,3}\[([^\]]+)]:\s*(<[^>]+>|\S+)/;

  linkableContent.split('\n').forEach((line, lineIndex) => {
    const lineNumber = lineIndex + 1;
    let inlineMatch: RegExpExecArray | null;

    while ((inlineMatch = inlineLinkRegex.exec(line)) !== null) {
      const linkStartIndex = inlineMatch.index + (inlineMatch[1]?.length ?? 0);
      const isCodeSpanLink = isInsideMarkdownCodeSpan(line, linkStartIndex);
      if (isCodeSpanLink) continue;

      addMarkdownSpecifier(
        specifiers,
        inlineMatch[3] ?? '',
        inlineMatch[2] ?? '',
        lineNumber
      );
    }

    const referenceMatch = line.match(referenceDefinitionRegex);
    if (!referenceMatch) return;

    addMarkdownSpecifier(
      specifiers,
      referenceMatch[2] ?? '',
      referenceMatch[1] ?? '',
      lineNumber
    );
  });

  return specifiers;
}
