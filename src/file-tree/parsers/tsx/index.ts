import ts from 'typescript';
import { type OutlineResult, type Parser, type Section } from '@/file-tree/types';
import { getExportedKind } from './index/get-exported-kind';
import { getExpressionName } from './index/get-expression-name';
import { isExported } from './index/is-exported';

type AddSection = (title: string, node: ts.Node, kind: string, level: number) => void;
type VisitNode = (node: ts.Node, level: number) => void;

export const tsxParser: Parser = {
  parse(content: string): OutlineResult {
    const lines = content.split('\n');
    const sections: Section[] = [];
    const sourceFile = ts.createSourceFile(
      'temp.tsx',
      content,
      ts.ScriptTarget.Latest,
      true
    );

    const addSection: AddSection = (title, node, kind, level) => {
      const { line: startLine } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      const { line: endLine } = sourceFile.getLineAndCharacterOfPosition(node.getEnd());

      sections.push({
        level,
        title,
        kind,
        fullHeading: lines[startLine] ?? title,
        startLine: startLine + 1,
        endLine: endLine + 1,
      });
    };

    const recurseChildren = (node: ts.Node, level: number): void => {
      ts.forEachChild(node, child => visitNode(child, level));
    };

    const visitImport = (node: ts.Node, level: number): boolean => {
      const isImportNode = ts.isImportDeclaration(node);
      if (!isImportNode) return false;

      const moduleSpecifier = node.moduleSpecifier;
      const hasStringModuleSpecifier = ts.isStringLiteralLike(moduleSpecifier);
      if (!hasStringModuleSpecifier) return true;

      addSection(moduleSpecifier.text, node, 'import', level);
      return true;
    };

    const visitFunction = (node: ts.Node, level: number): boolean => {
      const isFunctionDeclaration = ts.isFunctionDeclaration(node);
      const isAnonymousFunction =
        ts.isFunctionExpression(node) || ts.isArrowFunction(node);
      const isFunctionLike = isFunctionDeclaration || isAnonymousFunction;

      if (!isFunctionLike) return false;

      if (!isFunctionDeclaration) {
        recurseChildren(node, level + 1);
        return true;
      }

      const title = node.name?.text ?? 'anonymous';
      const isNamedFunction = title !== 'anonymous';
      if (isNamedFunction) {
        addSection(title, node, getExportedKind('func', node), level);
      }

      recurseChildren(node, level + 1);
      return true;
    };

    const visitClass = (node: ts.Node, level: number): boolean => {
      const isClassNode = ts.isClassDeclaration(node);
      if (!isClassNode) return false;

      const title = node.name?.text ?? 'anonymous';
      addSection(title, node, getExportedKind('class', node), level);
      recurseChildren(node, level + 1);
      return true;
    };

    const visitInterface = (node: ts.Node, level: number): boolean => {
      const isInterfaceNode = ts.isInterfaceDeclaration(node);
      if (!isInterfaceNode) return false;

      addSection(node.name.text, node, getExportedKind('intf', node), level);
      recurseChildren(node, level + 1);
      return true;
    };

    const visitTypeAlias = (node: ts.Node, level: number): boolean => {
      const isTypeAliasNode = ts.isTypeAliasDeclaration(node);
      if (!isTypeAliasNode) return false;

      addSection(node.name.text, node, getExportedKind('type', node), level);
      recurseChildren(node, level + 1);
      return true;
    };

    const visitVariableStatement = (node: ts.Node, level: number): boolean => {
      const isVariableStatementNode = ts.isVariableStatement(node);
      if (!isVariableStatementNode) return false;

      const exported = isExported(node);
      for (const declaration of node.declarationList.declarations) {
        visitVariableDeclaration(declaration, level, exported);
      }

      return true;
    };

    const visitMethod = (node: ts.Node, level: number): boolean => {
      const isMethodNode = ts.isMethodDeclaration(node) || ts.isMethodSignature(node);
      if (!isMethodNode) return false;

      const hasIdentifierName = ts.isIdentifier(node.name);
      if (!hasIdentifierName) return true;

      addSection(node.name.text, node, 'meth', level);
      recurseChildren(node, level + 1);
      return true;
    };

    const visitProperty = (node: ts.Node, level: number): boolean => {
      const isPropertyNode = ts.isPropertyDeclaration(node) || ts.isPropertySignature(node);
      if (!isPropertyNode) return false;

      const hasIdentifierName = ts.isIdentifier(node.name);
      if (!hasIdentifierName) return true;

      const hasFunctionInitializer =
        ts.isPropertyDeclaration(node) &&
        node.initializer !== undefined &&
        (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer));
      const kind = hasFunctionInitializer ? 'meth' : 'prop';

      addSection(node.name.text, node, kind, level);
      recurseChildren(node, level + 1);
      return true;
    };

    const visitPropertyAssignment = (node: ts.Node, level: number): boolean => {
      const isPropertyAssignmentNode = ts.isPropertyAssignment(node);
      if (!isPropertyAssignmentNode) return false;

      const hasSupportedName = ts.isIdentifier(node.name) || ts.isStringLiteral(node.name);
      if (!hasSupportedName) return true;

      const hasFunctionInitializer =
        ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer);
      const kind = hasFunctionInitializer ? 'meth' : 'prop';

      addSection(node.name.text, node, kind, level);
      recurseChildren(node, level + 1);
      return true;
    };

    const visitCallExpression = (node: ts.Node, level: number): boolean => {
      const isCallNode = ts.isCallExpression(node);
      if (!isCallNode) return false;

      const hasCallback = node.arguments.some(
        argument => ts.isArrowFunction(argument) || ts.isFunctionExpression(argument)
      );
      if (!hasCallback) return false;

      const name = getExpressionName(node.expression);
      if (name === null) return false;

      addSection(`${name}() callback`, node, 'call', level);
      recurseChildren(node, level + 1);
      return true;
    };

    const visitBindingPattern = (
      node: ts.VariableDeclaration,
      level: number,
      kind: string
    ): void => {
      const isBindingPattern =
        ts.isObjectBindingPattern(node.name) || ts.isArrayBindingPattern(node.name);
      if (!isBindingPattern) return;

      for (const element of node.name.elements) {
        const isNamedBindingElement =
          ts.isBindingElement(element) && ts.isIdentifier(element.name);
        if (!isNamedBindingElement) continue;

        addSection(element.name.text, element, kind, level);
      }

      const hasInitializer = node.initializer !== undefined;
      if (hasInitializer) {
        visitNode(node.initializer, level + 1);
      }
    };

    const visitVariableDeclaration = (
      node: ts.VariableDeclaration,
      level: number,
      exported: boolean
    ): void => {
      const kind = exported ? 'var export' : 'var';
      const hasIdentifierName = ts.isIdentifier(node.name);

      if (!hasIdentifierName) {
        visitBindingPattern(node, level, kind);
        return;
      }

      const hasFunctionInitializer =
        node.initializer !== undefined &&
        (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer));
      let finalKind = kind;
      if (hasFunctionInitializer) {
        finalKind = exported ? 'func export' : 'func';
      }

      addSection(node.name.text, node, finalKind, level);

      const hasInitializer = node.initializer !== undefined;
      if (hasInitializer) {
        visitNode(node.initializer, level + 1);
      }
    };

    const visitNode: VisitNode = (node, level) => {
      const handledNode =
        visitImport(node, level) ||
        visitFunction(node, level) ||
        visitClass(node, level) ||
        visitInterface(node, level) ||
        visitTypeAlias(node, level) ||
        visitVariableStatement(node, level) ||
        visitMethod(node, level) ||
        visitProperty(node, level) ||
        visitPropertyAssignment(node, level) ||
        visitCallExpression(node, level);

      if (handledNode) return;

      recurseChildren(node, level);
    };

    ts.forEachChild(sourceFile, node => visitNode(node, 1));

    return { lines, sections };
  },
};
