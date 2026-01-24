import { type Parser, type OutlineResult, type Section } from '../../types';

export const markdownParser: Parser = {
  parse(content: string): OutlineResult {
    const lines = content.split('\n');
    const sections: Section[] = [];

    // Pass 1: Find all headings
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line?.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        sections.push({
          level: match[1]!.length,
          title: match[2]!,
          kind: match[1],
          fullHeading: line!,
          startLine: i + 1,
          endLine: lines.length, // temporary
        });
      }
    }

    // Pass 2: Calculate endLine
    for (let i = 0; i < sections.length; i++) {
      const current = sections[i];
      if (!current) continue;

      current.endLine = lines.length;

      for (let j = i + 1; j < sections.length; j++) {
        const next = sections[j];
        if (next && next.level <= current.level) {
          current.endLine = next.startLine - 1;
          break;
        }
      }
    }

    return { lines, sections };
  },
};
