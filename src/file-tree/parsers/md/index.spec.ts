import fs from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';
import { markdownParser } from './index';

const fixturesDir = path.join(__dirname, 'fixtures');
const files = fs.readdirSync(fixturesDir);

describe('Markdown Parser (Snapshots)', () => {
  files.forEach(file => {
    it(`should parse ${file} correctly`, () => {
      const content = fs.readFileSync(path.join(fixturesDir, file), 'utf-8');
      const { sections } = markdownParser.parse(content);
      
      // Snapshot only the sections (structure), not the full lines array to keep snapshots clean
      expect(sections).toMatchSnapshot();
    });
  });
});