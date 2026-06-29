import { SUPPORTED_EXTENSIONS } from '@/related-files/constants';
import { tryFile } from './try-file';

export function resolveWithSubstitutedExtensions(
  candidatePath: string,
  extension: string
): string | null {
  const withoutExtension = candidatePath.slice(0, -extension.length);

  for (const supportedExtension of SUPPORTED_EXTENSIONS) {
    const substitutedFile = tryFile(`${withoutExtension}${supportedExtension}`);
    if (substitutedFile) return substitutedFile;
  }

  return null;
}
