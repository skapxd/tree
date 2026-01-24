import { describe, it, expect } from 'vitest';
import { astroParser } from './index';
import { readFile } from '../../utils';
import { join } from 'path';

describe('Astro Parser', () => {
  it('should parse basic Astro file with frontmatter', () => {
    const filePath = join(__dirname, 'fixtures', 'basic.astro');
    const content = readFile(filePath);
    const { sections } = astroParser.parse(content);

    // Should find the interface Props
    const props = sections.find(s => s.title === 'Props');
    expect(props).toBeDefined();
    expect(props?.kind).toBe('intf');

    // Should find destructured variables
    const hrefVar = sections.find(s => s.title === 'href' && s.kind === 'var');
    expect(hrefVar).toBeDefined();

    // Should find functions
    const formatFunc = sections.find(s => s.title === 'format');
    expect(formatFunc).toBeDefined();

    // Should find components in template
    const layoutComp = sections.find(s => s.title === 'Layout' && s.kind === 'comp');
    expect(layoutComp).toBeDefined();
    
    // Should NOT find standard HTML elements like 'li' or 'div' or 'a' 
    const liElem = sections.find(s => s.title === 'li' || s.title.startsWith('li.'));
    expect(liElem).toBeUndefined();

    const cardComp = sections.find(s => s.title === 'Card' && s.kind === 'comp');
    expect(cardComp).toBeDefined();

    // Verify HTML with ID
    const idFilePath = join(__dirname, 'fixtures', 'ids.astro');
    const idContent = readFile(idFilePath);
    const idResult = astroParser.parse(idContent);
    const divId = idResult.sections.find(s => s.title === 'section#hero-section');
    expect(divId).toBeDefined();
    expect(divId?.kind).toBe('elem');
    
    // Check line numbers (approximate check based on fixture)
    // "interface Props" starts at line 5
    expect(props?.startLine).toBe(5);
  });
});
