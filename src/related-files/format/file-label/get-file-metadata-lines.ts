import { getMarkdownTitle } from './get-markdown-title';

export function getFileMetadataLines(file: string): string[] {
  const title = getMarkdownTitle(file);
  return title === null ? [] : [`title: ${title}`];
}
