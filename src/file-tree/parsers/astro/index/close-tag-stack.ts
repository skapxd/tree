export function closeTagStack(stack: string[], name: string): void {
  const last = stack[stack.length - 1];
  const closesCurrentTag = last === name;
  if (closesCurrentTag) {
    stack.pop();
  }
}
