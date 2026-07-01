import { formatOutputContextSummary } from './format-output-context-summary';
import { type SummaryStyleOptions } from '@/shared/summary-style';

const MAX_STABILIZATION_PASSES = 8;
const OUTPUT_CONTEXT_SEPARATOR = '\n\n';

export function appendOutputContextSummary(
  output: string,
  options: SummaryStyleOptions = {}
): string {
  let currentOutput = `${output}${OUTPUT_CONTEXT_SEPARATOR}${formatOutputContextSummary(output, options)}`;

  for (let pass = 0; pass < MAX_STABILIZATION_PASSES; pass += 1) {
    const nextOutput = `${output}${OUTPUT_CONTEXT_SEPARATOR}${formatOutputContextSummary(currentOutput, options)}`;
    const reachedStableOutput = nextOutput === currentOutput;
    if (reachedStableOutput) return currentOutput;

    currentOutput = nextOutput;
  }

  return currentOutput;
}
