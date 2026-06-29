import { tsxParser } from '@/file-tree/parsers/tsx';

// Re-use TSX parser as it handles JS syntax fully (just ignores types if missing)
export const jsxParser = tsxParser;
