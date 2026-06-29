import path from 'node:path';
import ts from 'typescript';
import { type PathMapping, type ResolverOptions } from '@/related-files/types';
import { createPathMapping } from './create-path-mapping';
import { getRawCompilerOptions } from './get-raw-compiler-options';

export function readTsConfig(root: string): ResolverOptions {
  const tsConfigPath = path.join(root, 'tsconfig.json');
  const fallback: ResolverOptions = { root, baseUrl: null, pathMappings: [] };
  const hasTsConfig = ts.sys.fileExists(tsConfigPath);

  if (!hasTsConfig) return fallback;

  const configFile = ts.readConfigFile(tsConfigPath, ts.sys.readFile);
  const hasConfigReadError = configFile.error !== undefined;
  if (hasConfigReadError) return fallback;

  const compilerOptions = getRawCompilerOptions(configFile.config);
  if (compilerOptions === null) return fallback;

  const baseUrl = compilerOptions.baseUrl === null
    ? null
    : path.resolve(root, compilerOptions.baseUrl);
  const pathMappings: PathMapping[] = [];

  const pathEntries =
    compilerOptions.paths === null ? [] : Object.entries(compilerOptions.paths);
  for (const [alias, rawTargets] of pathEntries) {
    const pathMapping = createPathMapping(alias, rawTargets);
    if (pathMapping === null) continue;

    pathMappings.push(pathMapping);
  }

  pathMappings.sort((left, right) => right.prefix.length - left.prefix.length);

  return { root, baseUrl, pathMappings };
}
