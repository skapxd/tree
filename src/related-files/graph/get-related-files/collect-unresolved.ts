import { getEdgeMetadata } from '@/related-files/graph/edge-metadata';
import {
  type DependencyGraph,
  type UnresolvedImportEntry,
} from '@/related-files/types';

export function collectUnresolved(
  graph: DependencyGraph,
  files: Set<string>
): UnresolvedImportEntry[] {
  const unresolved: UnresolvedImportEntry[] = [];

  for (const file of Array.from(files).sort()) {
    const specifiers = graph.unresolvedImportsByFile.get(file) ?? [];
    for (const specifier of specifiers) {
      const metadata = getEdgeMetadata(graph.edgeMetadataByFile, file, specifier);
      unresolved.push({
        file,
        specifier,
        ...(metadata === undefined ? {} : { metadata }),
      });
    }
  }

  return unresolved;
}
