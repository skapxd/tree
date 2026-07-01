import path from 'node:path';
import { readSymbolicLinkTarget } from './read-symbolic-link-target';

const UNREADABLE_SYMBOLIC_LINK_TARGET = '(unreadable target)';

export function formatSymbolicLinkLabel(filePath: string): string {
  const fileName = path.basename(filePath);
  const target = readSymbolicLinkTarget(filePath) ?? UNREADABLE_SYMBOLIC_LINK_TARGET;

  return `${fileName} -> ${target}`;
}
