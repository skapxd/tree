import ts, { type BindingName } from 'typescript';

export function getBindingNames(name: BindingName): string[] {
  if (ts.isIdentifier(name)) return [name.text];

  return name.elements.flatMap(element => {
    if (ts.isOmittedExpression(element)) return [];

    return getBindingNames(element.name);
  });
}
