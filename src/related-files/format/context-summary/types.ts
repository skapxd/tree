export type RelatedSummaryFile = {
  file: string;
  lines: number;
  characters: number;
  estimatedTokens: number;
  maxLineLength: number;
};

export type RelatedContextSummary = {
  filesShown: number;
  relatedFiles: number;
  totalLineCount: number;
  totalCharacterCount: number;
  estimatedTokenCount: number;
  medianLineCount: number;
  medianCharacterCount: number;
  maxLineLength: number;
  maxDepth: number;
  filesWithoutTextStats: number;
  unresolvedCount: number;
  largestFiles: RelatedSummaryFile[];
};
