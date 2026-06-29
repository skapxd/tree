import {
  addUnique,
  toSortedUnique,
} from '@/related-files/shared/collections';
import { normalizeRoot } from '@/related-files/shared/path';
import { readTextFile } from '@/related-files/shared/safety';
import { findSupportedFiles } from '@/related-files/scan/find-supported-files';
import {
  resolveImportSpecifier,
  shouldTrackUnresolvedSpecifier,
} from '@/related-files/resolve/resolve-import-specifier';
import { readTsConfig } from '@/related-files/resolve/read-tsconfig';
import { extractImportSpecifiers } from '@/related-files/extract/import-specifiers';
import {
  type DependencyGraph,
  type DependencyGraphOptions,
  type RelatedEdgeMetadata,
} from '@/related-files/types';
import { addEdgeMetadata } from './edge-metadata';

export function buildDependencyGraph(options: DependencyGraphOptions): DependencyGraph {
  const root = normalizeRoot(options.root);
  const files = findSupportedFiles(root, options.ignore);
  const fileSet = new Set(files);
  const resolverOptions = readTsConfig(root);
  const importsByFile = new Map<string, string[]>();
  const unresolvedImportsByFile = new Map<string, string[]>();
  const edgeMetadataByFile = new Map<string, Map<string, RelatedEdgeMetadata[]>>();

  for (const file of files) {
    const imports: string[] = [];
    const unresolvedImports: string[] = [];
    const content = readTextFile(file);

    const hasContent = content !== null;
    if (!hasContent) {
      importsByFile.set(file, toSortedUnique(imports));
      continue;
    }

    for (const extractedSpecifier of extractImportSpecifiers(file, content)) {
      const resolved = resolveImportSpecifier(
        file,
        extractedSpecifier.specifier,
        resolverOptions
      );
      const isResolvedLocalImport = resolved !== null && fileSet.has(resolved);

      if (isResolvedLocalImport) {
        addUnique(imports, resolved);
        addEdgeMetadata(
          edgeMetadataByFile,
          file,
          resolved,
          extractedSpecifier.metadata
        );
        continue;
      }

      const shouldTrackAsUnresolved = shouldTrackUnresolvedSpecifier(
        file,
        extractedSpecifier.specifier,
        resolverOptions
      );
      if (shouldTrackAsUnresolved) {
        addUnique(unresolvedImports, extractedSpecifier.specifier);
        addEdgeMetadata(
          edgeMetadataByFile,
          file,
          extractedSpecifier.specifier,
          extractedSpecifier.metadata
        );
      }
    }

    importsByFile.set(file, toSortedUnique(imports));
    const hasUnresolvedImports = unresolvedImports.length > 0;
    if (hasUnresolvedImports) {
      unresolvedImportsByFile.set(file, toSortedUnique(unresolvedImports));
    }
  }

  const importersByFile = new Map<string, string[]>();
  for (const file of files) {
    importersByFile.set(file, []);
  }

  for (const [file, imports] of importsByFile.entries()) {
    for (const importedFile of imports) {
      const importers = importersByFile.get(importedFile) ?? [];
      addUnique(importers, file);
      importersByFile.set(importedFile, toSortedUnique(importers));
    }
  }

  return {
    root,
    files,
    importsByFile,
    importersByFile,
    unresolvedImportsByFile,
    edgeMetadataByFile,
  };
}
