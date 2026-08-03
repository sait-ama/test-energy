import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

import { baseConfig } from './base.js';

const reactRules = {
  files: ['**/*.{js,jsx,ts,tsx}'],
  plugins: {
    react: pluginReact,
    'react-hooks': pluginReactHooks,
    'simple-import-sort': simpleImportSort,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // React specific rules
    'react/jsx-curly-brace-presence': [
      'error',
      {
        props: 'never',
        children: 'never',
        propElementValues: 'always',
      },
    ],
    'react/jsx-boolean-value': ['error', 'never'],
    'react/react-in-jsx-scope': 'off',

    // Import sort для React
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          // React imports
          ['^react', '^@react'],
          // External packages
          ['^@?\\w'],
          // Internal @re packages
          ['^@re/'],
          // Internal aliases
          ['^~'],
          // Relative imports
          ['^\\.\\.(?!/?$)', '^\\.\\./?$', '^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
          // Style imports
          ['^.+\\.?(css|scss)$'],
          // Type imports
          ['^@types'],
        ],
      },
    ],

    // React Hooks
    ...pluginReactHooks.configs.recommended.rules,
  },
};

export const reactConfig = [...baseConfig, reactRules];
