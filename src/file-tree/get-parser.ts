import path from 'node:path';
import { astroParser } from './parsers/astro';
import { jsxParser } from './parsers/jsx';
import { markdownParser } from './parsers/md';
import { tsxParser } from './parsers/tsx';
import { type Parser } from './types';

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
  const extension = path.extname(filePath).toLowerCase();
  return parsers[extension] ?? markdownParser;
}
