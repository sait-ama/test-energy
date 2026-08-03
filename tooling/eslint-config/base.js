import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import onlyWarn from 'eslint-plugin-only-warn';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import turboPlugin from 'eslint-plugin-turbo';
import unusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';

const baseRules = {
  files: ['**/*.{js,jsx,ts,tsx}'],
  plugins: {
    '@typescript-eslint': tseslint.plugin,
    'unused-imports': unusedImports,
    'simple-import-sort': simpleImportSort,
    turbo: turboPlugin,
    'only-warn': onlyWarn,
  },
  ignores: [
    // Default directories
    '**/node_modules/',
    '**/dist/',
    '**/build/',
    '**/public/',
    '**/coverage/',
    '**/.next/*',
    '**/out/',

    // Cache directories
    '**/.cache/',
    '**/.turbo/',

    // Hidden files/directories (except config files)
    '**/.*',
    '!**/.eslintrc.*', // Keep ESLint configs
    '!**/.prettierrc.*', // Keep Prettier configs
    '!**/tsconfig.*', // Keep TS configs
    '!**/package.json',

    // Lock files
    '**/package-lock.json',
    '**/yarn.lock',
    '**/pnpm-lock.yaml',

    // Logs
    '**/*.log',
    '**/logs/',

    // OS generated files
    '**/.DS_Store',

    // Test artifacts
    '**/__snapshots__/',

    // Next.js specific
    '**/next-env.d.ts',
    '**/next-static/',

    // VSCode settings
    '**/.vscode/',
  ],
  rules: {
    // TypeScript rules
    'no-unused-vars': 'off',
    'no-unused-expressions': 'off',
    '@typescript-eslint/no-unused-expressions': [
      'error',
      {
        allowTernary: true,
        allowTaggedTemplates: true,
        enforceForJSX: false,
      },
    ],
    '@typescript-eslint/no-require-imports': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-explicit-any': ['warn', { ignoreRestArgs: true }],
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-empty-object-type': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-use-before-define': [
      'error',
      {
        functions: false,
        classes: true,
        variables: true,
        typedefs: true,
      },
    ],
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'variable',
        format: null,
        // disable rule
      },
      {
        selector: 'function',
        format: [
          'camelCase',
          'PascalCase', // for React components
        ],
      },
      {
        selector: 'typeLike',
        format: ['PascalCase'],
      },
    ],

    // Turbo rules
    'turbo/no-undeclared-env-vars': 'warn',

    // Import rules
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          // Node.js builtins
          ['^node:'],
          // React and Next.js packages
          ['^react', '^next'],
          // External packages
          ['^@?\\w'],
          // Internal packages
          ['^~'],
          // Parent imports
          ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
          // Other relative imports
          ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
          // Style imports
          ['^.+\\.?(css|scss|sass|less|styl)$'],
          // Type imports
          ['^@types'],
          // Side effect imports
          ['^\\u0000'],
        ],
      },
    ],
    'simple-import-sort/exports': 'error',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
  },
};

export const baseConfig = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  baseRules,
];
