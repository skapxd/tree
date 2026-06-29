export type RelatedFilesDirection = 'imports' | 'importers' | 'both';

export type RelatedEdgeMetadata = {
  text?: string;
  line?: number;
};

export type DependencyGraph = {
  root: string;
  files: string[];
  importsByFile: Map<string, string[]>;
  importersByFile: Map<string, string[]>;
  unresolvedImportsByFile: Map<string, string[]>;
  edgeMetadataByFile: Map<string, Map<string, RelatedEdgeMetadata[]>>;
};

export type DependencyGraphOptions = {
  root: string;
  ignore?: string | RegExp;
};

export type RelatedFileEntry = {
  file: string;
  depth: number;
};

export type RelatedFileBranch = {
  children: RelatedFileBranch[];
  circular?: boolean;
  repeated?: boolean;
} & RelatedFileEntry;

export type UnresolvedImportEntry = {
  file: string;
  specifier: string;
  metadata?: RelatedEdgeMetadata[];
};

export type RelatedFilesOptions = {
  file: string;
  root?: string;
  direction?: RelatedFilesDirection;
  maxDepth?: number;
  ignore?: string | RegExp;
};

export type RelatedFilesResult = {
  root: string;
  file: string;
  direction: RelatedFilesDirection;
  maxDepth: number;
  imports: RelatedFileEntry[];
  importers: RelatedFileEntry[];
  importTree: RelatedFileBranch[];
  importerTree: RelatedFileBranch[];
  unresolved: UnresolvedImportEntry[];
  edgeMetadataByFile: Map<string, Map<string, RelatedEdgeMetadata[]>>;
};

export type RelatedEntryGroup = {
  depth: number;
  files: string[];
};

export type RelatedFormatOptions = {
  color?: boolean;
};

export type ExtractedSpecifier = {
  specifier: string;
  metadata?: RelatedEdgeMetadata;
};

export type PathMapping = {
  prefix: string;
  suffix: string;
  targets: string[];
  hasWildcard: boolean;
};

export type ResolverOptions = {
  root: string;
  baseUrl: string | null;
  pathMappings: PathMapping[];
};

export type RawCompilerOptions = {
  baseUrl: string | null;
  paths: Record<string, unknown> | null;
};

export type NeighborGetter = (file: string) => string[];
