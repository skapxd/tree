import { readSymbolicLinkTarget } from './read-symbolic-link-target';

export function formatSymbolicLinkError(filePath: string): string {
  const target = readSymbolicLinkTarget(filePath);
  const targetSuffix = target === null ? '' : ` -> ${target}`;

  return `Related files mode does not follow symbolic links: ${filePath}${targetSuffix}. Use the real file path instead.`;
}
