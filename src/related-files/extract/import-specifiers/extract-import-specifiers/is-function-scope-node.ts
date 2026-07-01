import ts, { type Node } from 'typescript';

type FunctionScopeNode =
  | ts.ArrowFunction
  | ts.ConstructorDeclaration
  | ts.FunctionDeclaration
  | ts.FunctionExpression
  | ts.GetAccessorDeclaration
  | ts.MethodDeclaration
  | ts.SetAccessorDeclaration;

export function isFunctionScopeNode(node: Node): node is FunctionScopeNode {
  return ts.isArrowFunction(node)
    || ts.isConstructorDeclaration(node)
    || ts.isFunctionDeclaration(node)
    || ts.isFunctionExpression(node)
    || ts.isGetAccessor(node)
    || ts.isMethodDeclaration(node)
    || ts.isSetAccessor(node);
}
