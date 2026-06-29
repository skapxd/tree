import {
  type NeighborGetter,
  type RelatedFileBranch,
} from '@/related-files/types';

export function buildRelatedBranches(
  targetFile: string,
  getNeighbors: NeighborGetter,
  maxDepth: number,
  depth = 0,
  pathSet = new Set<string>([targetFile]),
  seen = new Set<string>([targetFile])
): RelatedFileBranch[] {
  const reachedMaxDepth = depth >= maxDepth;
  if (reachedMaxDepth) return [];

  return getNeighbors(targetFile).map(file => {
    const circular = pathSet.has(file);
    const repeated = !circular && seen.has(file);
    const branch: RelatedFileBranch = {
      file,
      depth: depth + 1,
      children: [],
    };

    if (circular) {
      branch.circular = true;
      return branch;
    }

    if (repeated) {
      branch.repeated = true;
      return branch;
    }

    seen.add(file);
    branch.children = buildRelatedBranches(
      file,
      getNeighbors,
      maxDepth,
      depth + 1,
      new Set([...pathSet, file]),
      seen
    );

    return branch;
  });
}
