import {
  type NeighborGetter,
  type RelatedFileEntry,
} from '@/related-files/types';

export function collectRelatedEntries(
  targetFile: string,
  getNeighbors: NeighborGetter,
  maxDepth: number
): RelatedFileEntry[] {
  const entries: RelatedFileEntry[] = [];
  const visited = new Set<string>([targetFile]);
  const queue: RelatedFileEntry[] = getNeighbors(targetFile).map(file => ({
    file,
    depth: 1,
  }));

  while (queue.length > 0) {
    const current = queue.shift();
    const lacksCurrentEntry = current === undefined;
    if (lacksCurrentEntry) continue;

    const alreadyVisitedFile = visited.has(current.file);
    if (alreadyVisitedFile) continue;

    visited.add(current.file);
    entries.push(current);

    const reachedMaxDepth = current.depth >= maxDepth;
    if (reachedMaxDepth) continue;

    for (const neighbor of getNeighbors(current.file)) {
      const alreadyQueuedNeighbor = visited.has(neighbor);
      if (alreadyQueuedNeighbor) continue;

      queue.push({ file: neighbor, depth: current.depth + 1 });
    }
  }

  return entries;
}
