import {
  cleanMarkdownTitle,
  stripMarkdownFencedCode,
} from '@/related-files/extract/markdown-links';
import { isMarkdownFile } from '@/related-files/shared/path';
import { readTextFile } from '@/related-files/shared/safety';

export function getMarkdownTitle(filePath: string): string | null {
  const isMarkdown = isMarkdownFile(filePath);
  if (!isMarkdown) return null;

  const content = readTextFile(filePath);
  const lacksContent = content === null || content.length === 0;
  if (lacksContent) return null;

  const lines = stripMarkdownFencedCode(content).split('\n');
  let fallbackTitle: string | null = null;

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (!headingMatch) continue;

    const title = cleanMarkdownTitle(headingMatch[2] ?? '');
    const lacksTitle = title.length === 0;
    if (lacksTitle) continue;

    const isPrimaryHeading = headingMatch[1] === '#';
    if (isPrimaryHeading) {
      return title;
    }

    fallbackTitle ??= title;
  }

  return fallbackTitle;
}
