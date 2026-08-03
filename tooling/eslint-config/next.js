import pluginNext from '@next/eslint-plugin-next';
import { globalIgnores } from 'eslint/config';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

import { reactConfig } from './react.js';

const nextRules = {
  files: ['**/*.{js,jsx,ts,tsx}'],
  plugins: {
    '@next/next': pluginNext,
    'simple-import-sort': simpleImportSort,
  },
  rules: {
    // Next.js specific rules
    ...pluginNext.configs.recommended.rules,
    ...pluginNext.configs['core-web-vitals'].rules,

    // Import sort для Next.js
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          // Next.js special imports
          ['^(use|USE) (client|server)$'],
          // React and Next.js packages
          ['^react', '^next'],
          // Other external packages
          ['^@?\\w'],
          // Internal @re packages
          ['^@re/'],
          // Internal aliases
          ['^~'],
          // Relative imports
          ['^\\.\\.(?!/?$)', '^\\.\\./?$', '^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
          // Styles
          ['^.+\\.?(css|scss)$'],
          // Types
          ['^@types'],
        ],
      },
    ],
  },
};

export const nextJsConfig = [...reactConfig, nextRules, globalIgnores(['.next/*'])];
