import fs from 'fs';
import path from 'path';

/**
 * Reads .gitignore from the target directory and creates a RegExp for filtering.
 * NOTE: This is a simplified implementation. It handles basic patterns like:
 * - node_modules
 * - dist/
 * - *.log
 * It does NOT fully support advanced gitignore globbing (negation, nested paths).
 */
export function getGitIgnoreRegex(dirPath: string, includeDefaults = true): RegExp | null {
  const gitIgnorePath = path.join(dirPath, '.gitignore');
  const hasGitIgnore = fs.existsSync(gitIgnorePath);
  
  const regexParts: string[] = [];

  if (hasGitIgnore) {
    try {
      const content = fs.readFileSync(gitIgnorePath, 'utf-8');
      const lines = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));

      lines.forEach(pattern => {
        // Remove trailing slash for directories (e.g. "dist/" -> "dist")
        let p = pattern;
        if (p.endsWith('/')) p = p.slice(0, -1);
        if (p.startsWith('/')) p = p.slice(1);

        // Escape special regex characters except *
        let escaped = p.replace(/[.+?^${}()|[\\]/g, '\\$&');

        // Convert glob * to regex .*
        escaped = escaped.replace(/\*/g, '.*');

        regexParts.push(`^${escaped}$`);
      });
    } catch {
      // ignore
    }
  }

  // Always add .git and .DS_Store if defaults are requested
  if (includeDefaults) {
    regexParts.push('^\.git$');
    regexParts.push('^\.DS_Store$');
  }

  if (regexParts.length === 0) return null;

  return new RegExp(regexParts.join('|'));
}