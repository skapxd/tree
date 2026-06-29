import { normalizeRoot } from '@/related-files/shared/path';
import {
  type NeighborGetter,
  type RelatedFilesOptions,
  type RelatedFilesResult,
} from '@/related-files/types';
import { buildDependencyGraph } from '@/related-files/graph/build-dependency-graph';
import { buildRelatedBranches } from './build-related-branches';
import { collectRelatedEntries } from './collect-related-entries';
import { collectUnresolved } from './collect-unresolved';
import { normalizeDirection } from './normalize-direction';
import { normalizeMaxDepth } from './normalize-max-depth';
import { resolveTargetFile } from './resolve-target-file';

export function getRelatedFiles(options: RelatedFilesOptions): RelatedFilesResult {
  const root = normalizeRoot(options.root ?? process.cwd());
  const graph = buildDependencyGraph(
    options.ignore === undefined ? { root } : { root, ignore: options.ignore }
  );
  const file = resolveTargetFile(options.file, root, graph);
  const direction = normalizeDirection(options.direction);
  const maxDepth = normalizeMaxDepth(options.maxDepth);

  const importNeighborGetter: NeighborGetter = currentFile =>
    graph.importsByFile.get(currentFile) ?? [];
  const importerNeighborGetter: NeighborGetter = currentFile =>
    graph.importersByFile.get(currentFile) ?? [];

  const imports =
    direction === 'imports' || direction === 'both'
      ? collectRelatedEntries(file, importNeighborGetter, maxDepth)
      : [];
  const importers =
    direction === 'importers' || direction === 'both'
      ? collectRelatedEntries(file, importerNeighborGetter, maxDepth)
      : [];

  const importTree =
    direction === 'imports' || direction === 'both'
      ? buildRelatedBranches(file, importNeighborGetter, maxDepth)
      : [];
  const importerTree =
    direction === 'importers' || direction === 'both'
      ? buildRelatedBranches(file, importerNeighborGetter, maxDepth)
      : [];

  const relatedFiles = new Set<string>([file]);
  for (const entry of [...imports, ...importers]) {
    relatedFiles.add(entry.file);
  }

  return {
    root,
    file,
    direction,
    maxDepth,
    imports,
    importers,
    importTree,
    importerTree,
    unresolved: collectUnresolved(graph, relatedFiles),
    edgeMetadataByFile: graph.edgeMetadataByFile,
  };
}
