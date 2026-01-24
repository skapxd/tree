import { describe, it, expect } from 'vitest';
import { jsxParser } from './index';
import { readFile } from '../../utils';
import { join } from 'path';

describe('JSX Parser', () => {
  it('should parse basic JSX file', () => {
    const filePath = join(__dirname, 'fixtures', 'basic.jsx');
    const content = readFile(filePath);
    const { sections } = jsxParser.parse(content);

    expect(sections).toMatchSnapshot();
    
    // Quick verification of expected structure
    const titles = sections.map(s => s.title);
    expect(titles).toContain('Button');
    expect(titles).toContain('Card');
    expect(titles).toContain('render');
    expect(titles).toContain('helper');
  });
});
