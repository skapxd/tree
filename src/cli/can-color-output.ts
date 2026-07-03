import { shouldColorOutput } from './should-color-output';

export function canColorOutput(outputPath: string | undefined): boolean {
  return shouldColorOutput() && outputPath === undefined;
}
