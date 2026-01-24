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
export function getGitIgnoreRegex(dirPath: string): RegExp | null {
  const gitIgnorePath = path.join(dirPath, '.gitignore');
  
  if (!fs.existsSync(gitIgnorePath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(gitIgnorePath, 'utf-8');
    const lines = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));

    if (lines.length === 0) return null;

    const regexParts = lines.map(pattern => {
      // Remove trailing slash for directories (e.g. "dist/" -> "dist")
      // We want to match the directory name itself.
      let p = pattern;
      if (p.endsWith('/')) p = p.slice(0, -1);
      if (p.startsWith('/')) p = p.slice(1);

      // Escape special regex characters except *
      // Special chars: . + ? ^ $ { } ( ) | [ ] \
      // We want to keep * as wildcard.
      let escaped = p.replace(/[.+?^${}()|[\\]/g, '\\$&');

      // Convert glob * to regex .*
      escaped = escaped.replace(/\*/g, '.*');

      // Ensure full match to avoid partial matches (e.g. "dist" shouldn't match "distribution")
      // But "node_modules" should match "node_modules"
      return `^${escaped}$`;
    });

    // Combine all patterns into one OR regex
    // Always add .git and .DS_Store as they are standard clutter
    regexParts.push('^\\.git$');
    regexParts.push('^\\.DS_Store$');

    return new RegExp(regexParts.join('|'));
  } catch {
    return null;
  }
}
