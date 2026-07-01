export type RelatedSummaryFile = {
  file: string;
  lines: number;
};

export type RelatedContextSummary = {
  filesShown: number;
  relatedFiles: number;
  totalLineCount: number;
  medianLineCount: number;
  maxDepth: number;
  unreadableFiles: number;
  unresolvedCount: number;
  largestFiles: RelatedSummaryFile[];
};
