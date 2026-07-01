import { describe, expect, it } from 'vitest';
import { formatSummaryRow } from './format-summary-row';

describe('summary style', () => {
  it('colors only the value segment of key-value summary rows', () => {
    const result = formatSummaryRow('total chars: 1,200 chars', { color: true });

    expect(result).toBe('total chars: \x1b[36m1,200 chars\x1b[0m');
  });

  it('leaves non key-value rows untouched', () => {
    const result = formatSummaryRow('largest files by chars', { color: true });

    expect(result).toBe('largest files by chars');
  });
});
