import skapxd from '@skapxd/eslint-opinionated';

export default [
  {
    name: 'tree/ignores',
    ignores: [
      'dist/**',
      'coverage/**',
      'test-reports/**',
      'node_modules/**',
      'src/**/*.spec.ts',
      'src/**/__snapshots__/**',
      'src/**/fixtures/**',
    ],
  },
  {
    ...skapxd.configs.package,
    name: 'tree/skapxd-package',
    files: ['src/**/*.ts'],
  },
];
