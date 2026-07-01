import { ANSI_RESET, ANSI_SUMMARY_VALUE } from './constants';

export function colorSummaryValue(value: string, color = false): string {
  const shouldColorValue = color;
  if (!shouldColorValue) return value;

  return `${ANSI_SUMMARY_VALUE}${value}${ANSI_RESET}`;
}
