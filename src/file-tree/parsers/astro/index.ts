import { tsxParser } from '@/file-tree/parsers/tsx';
import { type OutlineResult, type Parser, type Section } from '@/file-tree/types';

type AstroTag = {
  attrs: string;
  index: number;
  isSelfClosing: boolean;
  rawName: string;
};

const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

const astroParserHelpers = {
  closeTagStack(stack: string[], name: string): void {
    const last = stack[stack.length - 1];
    const closesCurrentTag = last === name;
    if (closesCurrentTag) {
      stack.pop();
    }
  },

  getId(attrs: string): string | null {
    const idMatch = attrs.match(/id=["']([^"']+)["']/);
    return idMatch?.[1] ?? null;
  },

  getStartLine(content: string, totalIndex: number): number {
    return content.slice(0, totalIndex).split(/\r\n|\r|\n/).length;
  },

  getTag(match: RegExpExecArray): AstroTag | null {
    const rawName = match[1];
    const attrs = match[2];
    const selfClosingMarker = match[3];
    const lacksTagParts =
      rawName === undefined || attrs === undefined || selfClosingMarker === undefined;
    if (lacksTagParts) return null;

    const normalizedName = rawName.toLowerCase().replace('/', '');
    const isSelfClosing = selfClosingMarker === '/' || VOID_ELEMENTS.has(normalizedName);

    return {
      attrs,
      index: match.index,
      isSelfClosing,
      rawName,
    };
  },

  getVisibleTitle(name: string, id: string | null): string {
    return id === null ? name : `${name}#${id}`;
  },

  getVisibleFullHeading(lines: string[], startLine: number, title: string): string {
    const line = lines[startLine - 1]?.trim();
    const lacksLine = line === undefined || line.length === 0;
    return lacksLine ? title : line;
  },

  isComponent(name: string): boolean {
    return /^[A-Z]/.test(name);
  },
};

export const astroParser: Parser = {
  parse(content: string): OutlineResult {
    const lines = content.split('\n');
    const sections: Section[] = [];
    const frontmatterRegex = /^---\r?\n([\s\S]*?)\n---/;
    const frontmatterMatch = content.match(frontmatterRegex);
    let templateStartIndex = 0;

    const hasFrontmatter = frontmatterMatch !== null;
    if (hasFrontmatter) {
      const frontmatterContent = frontmatterMatch[1] ?? '';
      const result = tsxParser.parse(frontmatterContent);
      const shiftedSections = result.sections.map(section => ({
        ...section,
        startLine: section.startLine + 1,
        endLine: section.endLine + 1,
      }));
      sections.push(...shiftedSections);
      templateStartIndex = frontmatterMatch[0].length;
    }

    const templateContent = content.slice(templateStartIndex);
    const tagRegex = /<(\/?[a-zA-Z0-9\.-]+)([^>]*?)(\/?)>/g;
    const stack: string[] = [];
    let tagMatch: RegExpExecArray | null;

    while ((tagMatch = tagRegex.exec(templateContent)) !== null) {
      const tag = astroParserHelpers.getTag(tagMatch);
      if (tag === null) continue;

      const isClosingTag = tag.rawName.startsWith('/');
      if (isClosingTag) {
        astroParserHelpers.closeTagStack(stack, tag.rawName.slice(1));
        continue;
      }

      const name = tag.rawName;
      const isComponent = astroParserHelpers.isComponent(name);
      const isCustomElement = name.includes('-');
      const id = astroParserHelpers.getId(tag.attrs);
      const hasId = id !== null;
      const shouldShow = isComponent || isCustomElement || hasId;

      if (shouldShow) {
        const title = astroParserHelpers.getVisibleTitle(name, id);
        const totalIndex = templateStartIndex + tag.index;
        const startLine = astroParserHelpers.getStartLine(content, totalIndex);

        sections.push({
          level: 1 + stack.length,
          title,
          kind: isComponent ? 'comp' : 'elem',
          fullHeading: astroParserHelpers.getVisibleFullHeading(lines, startLine, title),
          startLine,
          endLine: startLine,
        });
      }

      if (!tag.isSelfClosing) {
        stack.push(name);
      }
    }

    return { lines, sections };
  },
};
