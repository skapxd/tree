import { formatSummaryRow, type SummaryStyleOptions } from '@/shared/summary-style';
import { type SummarySection } from './types';

export function appendSections(
  lines: string[],
  sections: SummarySection[],
  options: SummaryStyleOptions = {}
): void {
  sections.forEach((section, sectionIndex) => {
    const isLastSection = sectionIndex === sections.length - 1;
    lines.push(`${isLastSection ? '└──' : '├──'} ${section.label}`);

    section.children.forEach((child, childIndex) => {
      const isLastChild = childIndex === section.children.length - 1;
      const prefix = isLastSection ? '    ' : '│   ';
      lines.push(`${prefix}${isLastChild ? '└──' : '├──'} ${formatSummaryRow(child, options)}`);
    });
  });
}
