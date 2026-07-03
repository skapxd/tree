import { type TreeSummary } from '@/fs-tree/summary';

export type DrawOptions = {
  color?: boolean;
  summary?: TreeSummary;
};

export type DrawContext = {
  lines: string[];
  options: DrawOptions;
};
