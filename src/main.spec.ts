import { describe, it, expect } from 'vitest';
import * as main from './index';

describe('main entry point', () => {
  it('should export tree function', () => {
    expect(main.tree).toBeDefined();
    expect(typeof main.tree).toBe('function');
  });

  it('should export fileTree module', () => {
    expect(main.fileTree).toBeDefined();
    expect(main.fileTree.getParser).toBeDefined();
  });
});
