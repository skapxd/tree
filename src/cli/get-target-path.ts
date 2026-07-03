import { type CliOptions } from './types';
import { getStringOption } from './get-string-option';

export function getTargetPath(dirArg: unknown, options: CliOptions): string {
  const positionalPath = getStringOption(dirArg);
  return positionalPath ?? options.directory ?? process.cwd();
}
