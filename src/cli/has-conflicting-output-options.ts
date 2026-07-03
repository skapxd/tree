import { hasOutputPathOption } from './has-output-path-option';
import { isRecord } from './is-record';

export function hasConflictingOutputOptions(value: unknown): boolean {
  const rawOptions = isRecord(value) ? value : {};
  const hasOutputOption = hasOutputPathOption(rawOptions.output);
  const hasLegacyExportOption = hasOutputPathOption(rawOptions.export);
  return hasOutputOption && hasLegacyExportOption;
}
