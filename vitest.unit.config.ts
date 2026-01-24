import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts'],
    globals: true, // Para poder usar describe, it, expect sin importar (opcional, pero cómodo)
    reporters: ['default', 'html'],
    outputFile: path.resolve(__dirname, 'test-reports/unit/index.html'),
    alias: {
      '@skapxd/tree': path.resolve(__dirname, './src/index.ts'),
    },
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: path.resolve(__dirname, 'test-reports/coverage'),
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'dist/**/*', 'src/cli.ts', 'src/file-tree/cli.ts'], // Excluir CLI de unit tests
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
