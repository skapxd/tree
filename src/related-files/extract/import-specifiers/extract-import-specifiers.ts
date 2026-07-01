import path from 'node:path';
import ts from 'typescript';
import { addUnique } from '@/related-files/shared/collections';
import { isMarkdownFile } from '@/related-files/shared/path';
import { type ExtractedSpecifier } from '@/related-files/types';
import { extractMarkdownLinkSpecifiers } from '@/related-files/extract/markdown-links';
import {
  evaluateStaticStringExpression,
  type StaticStringScope,
} from './evaluate-static-string-expression';
import { getBindingNames } from './extract-import-specifiers/get-binding-names';
import { isBlockScopeNode } from './extract-import-specifiers/is-block-scope-node';
import { isFunctionScopeNode } from './extract-import-specifiers/is-function-scope-node';
import { getScriptKind } from './get-script-kind';
import { getSourceTextForImportParsing } from './get-source-text-for-import-parsing';
import { toExtractedSpecifiers } from './to-extracted-specifiers';

export function extractImportSpecifiers(
  filePath: string,
  content: string
): ExtractedSpecifier[] {
  const isMarkdownImportFile = isMarkdownFile(filePath);
  if (isMarkdownImportFile) {
    return extractMarkdownLinkSpecifiers(content);
  }

  const sourceText = getSourceTextForImportParsing(filePath, content);
  const specifiers: string[] = [];
  const scopes: StaticStringScope[] = [new Map<string, string[] | null>()];
  const sourceFile = ts.createSourceFile(
    path.basename(filePath),
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    getScriptKind(filePath)
  );

  function visit(node: ts.Node): void {
    if (isFunctionScopeNode(node)) {
      scopes.push(new Map<string, string[] | null>());
      markParametersAsDynamic(node.parameters);
      ts.forEachChild(node, visit);
      scopes.pop();
      return;
    }

    const isBlockScope = isBlockScopeNode(node);
    if (isBlockScope) {
      scopes.push(new Map<string, string[] | null>());
      ts.forEachChild(node, visit);
      scopes.pop();
      return;
    }

    if (ts.isVariableStatement(node)) {
      visitVariableStatement(node);
      return;
    }

    const isStaticImport =
      ts.isImportDeclaration(node) &&
      ts.isStringLiteralLike(node.moduleSpecifier);
    if (isStaticImport) {
      addUnique(specifiers, node.moduleSpecifier.text);
      ts.forEachChild(node, visit);
      return;
    }

    const isReExport =
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier !== undefined &&
      ts.isStringLiteralLike(node.moduleSpecifier);
    if (isReExport) {
      addUnique(specifiers, node.moduleSpecifier.text);
      ts.forEachChild(node, visit);
      return;
    }

    const isExternalImportEquals =
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference) &&
      ts.isStringLiteralLike(node.moduleReference.expression);
    if (isExternalImportEquals) {
      addUnique(specifiers, node.moduleReference.expression.text);
      ts.forEachChild(node, visit);
      return;
    }

    const isImportType =
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteralLike(node.argument.literal);
    if (isImportType) {
      addUnique(specifiers, node.argument.literal.text);
      ts.forEachChild(node, visit);
      return;
    }

    const isCallImport = ts.isCallExpression(node);
    if (!isCallImport) {
      ts.forEachChild(node, visit);
      return;
    }

    const firstArg = node.arguments[0];
    if (firstArg === undefined) {
      ts.forEachChild(node, visit);
      return;
    }

    const isDynamicImport = node.expression.kind === ts.SyntaxKind.ImportKeyword;
    const isCommonJsRequire =
      ts.isIdentifier(node.expression) && node.expression.text === 'require';
    const isImportCall = isDynamicImport || isCommonJsRequire;

    if (!isImportCall) {
      ts.forEachChild(node, visit);
      return;
    }

    const staticSpecifiers = evaluateStaticStringExpression(firstArg, scopes);
    if (staticSpecifiers !== null) {
      staticSpecifiers.forEach(specifier => addUnique(specifiers, specifier));
    }

    ts.forEachChild(node, visit);
  }

  function visitVariableStatement(node: ts.VariableStatement): void {
    const isConstStatement = (node.declarationList.flags & ts.NodeFlags.Const) !== 0;
    if (!isConstStatement) {
      markVariableDeclarationsAsDynamic(node.declarationList.declarations);
      ts.forEachChild(node, visit);
      return;
    }

    for (const declaration of node.declarationList.declarations) {
      const initializer = declaration.initializer;
      if (initializer !== undefined) {
        visit(initializer);
      }

      const bindingNames = getBindingNames(declaration.name);
      const staticValues = initializer === undefined
        ? null
        : evaluateStaticStringExpression(initializer, scopes);
      bindingNames.forEach(name => setStaticBinding(name, staticValues));
    }
  }

  function markVariableDeclarationsAsDynamic(
    declarations: ts.NodeArray<ts.VariableDeclaration>
  ): void {
    declarations.forEach(declaration => {
      const bindingNames = getBindingNames(declaration.name);
      bindingNames.forEach(name => setStaticBinding(name, null));
    });
  }

  function markParametersAsDynamic(parameters: ts.NodeArray<ts.ParameterDeclaration>): void {
    parameters.forEach(parameter => {
      const bindingNames = getBindingNames(parameter.name);
      bindingNames.forEach(name => setStaticBinding(name, null));
    });
  }

  function setStaticBinding(name: string, values: string[] | null): void {
    const scope = scopes[scopes.length - 1];
    if (scope === undefined) return;

    scope.set(name, values);
  }

  visit(sourceFile);

  return toExtractedSpecifiers(specifiers);
}
