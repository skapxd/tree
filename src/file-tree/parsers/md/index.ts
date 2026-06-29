import { type OutlineResult, type Parser, type Section } from '@/file-tree/types';

export const markdownParser: Parser = {
  parse(content: string): OutlineResult {
    const lines = content.split('\n');
    const sections: Section[] = [];

    for (const [index, line] of lines.entries()) {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match === null) continue;

      const marker = match[1];
      const title = match[2];
      const lacksHeadingParts = marker === undefined || title === undefined;
      if (lacksHeadingParts) continue;

      sections.push({
        level: marker.length,
        title,
        kind: marker,
        fullHeading: line,
        startLine: index + 1,
        endLine: lines.length,
      });
    }

    for (let index = 0; index < sections.length; index += 1) {
      const current = sections[index];
      if (current === undefined) continue;

      current.endLine = lines.length;

      for (let nextIndex = index + 1; nextIndex < sections.length; nextIndex += 1) {
        const next = sections[nextIndex];
        const closesCurrentSection =
          next !== undefined && next.level <= current.level;
        if (closesCurrentSection) {
          current.endLine = next.startLine - 1;
          break;
        }
      }
    }

    return { lines, sections };
  },
};
