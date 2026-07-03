import { tsxParser } from '@/file-tree/parsers/tsx';
import { type OutlineResult, type Parser, type Section } from '@/file-tree/types';
import { closeTagStack } from './index/close-tag-stack';
import { getId } from './index/get-id';
import { getStartLine } from './index/get-start-line';
import { getTag } from './index/get-tag';
import { getVisibleFullHeading } from './index/get-visible-full-heading';
import { getVisibleTitle } from './index/get-visible-title';
import { isComponentTag } from './index/is-component-tag';

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
      const tag = getTag(tagMatch);
      if (tag === null) continue;

      const isClosingTag = tag.rawName.startsWith('/');
      if (isClosingTag) {
        closeTagStack(stack, tag.rawName.slice(1));
        continue;
      }

      const name = tag.rawName;
      const isComponent = isComponentTag(name);
      const isCustomElement = name.includes('-');
      const id = getId(tag.attrs);
      const hasId = id !== null;
      const shouldShow = isComponent || isCustomElement || hasId;

      if (shouldShow) {
        const title = getVisibleTitle(name, id);
        const totalIndex = templateStartIndex + tag.index;
        const startLine = getStartLine(content, totalIndex);

        sections.push({
          level: 1 + stack.length,
          title,
          kind: isComponent ? 'comp' : 'elem',
          fullHeading: getVisibleFullHeading(lines, startLine, title),
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
