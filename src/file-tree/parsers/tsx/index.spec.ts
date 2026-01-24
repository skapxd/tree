import fs from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';
import { tsxParser } from './index';

const fixturesDir = path.join(__dirname, 'fixtures');
const files = fs.readdirSync(fixturesDir);

describe('TSX Parser (Snapshots)', () => {
  files.forEach(file => {
    it(`should parse ${file} correctly`, () => {
      const content = fs.readFileSync(path.join(fixturesDir, file), 'utf-8');
      const { sections } = tsxParser.parse(content);
      
      expect(sections).toMatchSnapshot();
    });
  });
});