import { type Section } from '@/file-tree/types';

export function findSection(sections: Section[], pattern: string): Section | undefined {
  const lowerPattern = pattern.toLowerCase();
  return sections.find(
    section =>
      section.fullHeading.toLowerCase().includes(lowerPattern) ||
      section.title.toLowerCase().includes(lowerPattern)
  );
}
