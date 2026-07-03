export function shouldColorOutput(): boolean {
  const colorDisabled = process.env.NO_COLOR !== undefined;
  if (colorDisabled) return false;

  const colorForced = process.env.FORCE_COLOR !== undefined && process.env.FORCE_COLOR !== '0';
  if (colorForced) return true;

  return process.stdout.isTTY === true;
}
