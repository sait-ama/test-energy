import globals from 'globals';

import { baseConfig } from './base.js';

export const nodeJsConfig = [
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-process-env': 'error',
      'no-process-exit': 'error',
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Node.js builtins first
            ['^node:'],
            // External packages
            ['^@?\\w'],
            // Internal packages
            ['^~'],
            // Parent/relative imports
            ['^\\.\\.(?!/?$)', '^\\.\\./?$', '^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            // Type imports
            ['^@types'],
          ],
        },
      ],
    },
  },
];
