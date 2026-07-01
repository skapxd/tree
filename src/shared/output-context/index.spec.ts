import { describe, expect, it } from 'vitest';
import {
  formatCharacterLabel,
  formatTokenEstimateLabel,
  getEstimatedTokenCount,
} from '@/shared/text-stats';
import { appendOutputContextSummary } from './append-output-context-summary';
import { stripAnsi } from './strip-ansi';

describe('output context summary', () => {
  it('appends the visible command output cost as a stable summary', () => {
    const result = appendOutputContextSummary('tree/\n└── index.ts');
    const expectedCharacterLabel = formatCharacterLabel(result.length);
    const expectedTokenLabel = formatTokenEstimateLabel(getEstimatedTokenCount(result.length));

    expect(result).toContain('output context');
    expect(result).toContain(
      `└── command output: ${expectedCharacterLabel}, ${expectedTokenLabel}`
    );
  });

  it('does not count terminal color escape sequences as agent context', () => {
    const result = appendOutputContextSummary('\x1b[2mtree/\x1b[0m');
    const visibleResult = stripAnsi(result);
    const expectedCharacterLabel = formatCharacterLabel(visibleResult.length);
    const expectedTokenLabel = formatTokenEstimateLabel(getEstimatedTokenCount(visibleResult.length));

    expect(result).toContain(
      `└── command output: ${expectedCharacterLabel}, ${expectedTokenLabel}`
    );
  });
});
