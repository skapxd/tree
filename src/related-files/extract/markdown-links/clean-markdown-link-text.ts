import { cleanMarkdownTitle } from './clean-markdown-title';

export function cleanMarkdownLinkText(text: string): string | null {
  const cleaned = cleanMarkdownTitle(text);
  const lacksText = cleaned.length === 0;
  return lacksText ? null : cleaned;
}
