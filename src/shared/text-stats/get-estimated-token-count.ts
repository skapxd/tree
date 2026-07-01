import { TOKEN_CHARACTER_ESTIMATE } from './constants';

export function getEstimatedTokenCount(characters: number): number {
  return Math.ceil(characters / TOKEN_CHARACTER_ESTIMATE);
}
