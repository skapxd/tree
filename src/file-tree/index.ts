import path from 'path';
import { type Parser, type OutlineResult, type Section } from './types';
import { markdownParser } from './parsers/md';
import { tsxParser } from './parsers/tsx';
import { jsxParser } from './parsers/jsx';
import { astroParser } from './parsers/astro';

export * from './types';
export * from './utils';
export * from './drawer';

const parsers: Record<string, Parser> = {
  '.md': markdownParser,
  '.markdown': markdownParser,
  '.ts': tsxParser,
  '.tsx': tsxParser,
  '.js': jsxParser,
  '.jsx': jsxParser,
  '.mjs': jsxParser,
  '.cjs': jsxParser,
  '.astro': astroParser,
};

export function getParser(filePath: string): Parser {
  const ext = path.extname(filePath).toLowerCase();
  const parser = parsers[ext];
  
  if (!parser) {
    // Default fallback or error?
    // Let's fallback to MD parser if it looks like text, or error.
    // For now, let's treat unknown as "plain text" which MD parser handles (returns 0 sections)
    return markdownParser;
  }
  
  return parser;
}

export function findSection(sections: Section[], pattern: string): Section | undefined {
  const lowerPattern = pattern.toLowerCase();
  return sections.find(
    (s) =>
      s.fullHeading.toLowerCase().includes(lowerPattern) ||
      s.title.toLowerCase().includes(lowerPattern)
  );
}