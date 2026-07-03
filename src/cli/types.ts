export type CliOptions = {
  depth: unknown;
  directory: string | undefined;
  ignore: string | undefined;
  onlyFolder: boolean;
  outputPath: string | undefined;
  related: unknown;
  root: string | undefined;
  summary: boolean;
  tree: boolean;
};

export type PackageJson = {
  version: string;
};
