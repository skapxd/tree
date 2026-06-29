import { type ExtractedSpecifier } from '@/related-files/types';

export function toExtractedSpecifiers(specifiers: string[]): ExtractedSpecifier[] {
  return specifiers.map(specifier => ({ specifier }));
}
