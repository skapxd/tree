import path from 'node:path';
import { resolveCandidate } from '@/related-files/resolve/resolve-candidate';
import { isInside } from '@/related-files/shared/path';
import { type DependencyGraph } from '@/related-files/types';

export function resolveTargetFile(
  filePath: string,
  root: string,
  graph: DependencyGraph
): string {
  const directFile = path.resolve(filePath);
  const resolved = resolveCandidate(directFile) ?? directFile;
  const isOutsideRoot = !isInside(root, resolved) && resolved !== root;

  if (isOutsideRoot) {
    throw new Error(`File must be inside the project root: ${filePath}`);
  }

  const isScannedFile = graph.files.includes(resolved);
  if (!isScannedFile) {
    throw new Error(`File is unsupported, ignored, or not found: ${filePath}`);
  }

  return resolved;
}
