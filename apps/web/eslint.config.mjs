import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import reactQuery from '@tanstack/eslint-plugin-query';
import reactCompiler from 'eslint-plugin-react-compiler';
import { nextJsConfig } from '@re/eslint-config/next-js';

export default [
  ...nextCoreWebVitals,
  ...nextTypescript,
  ...nextJsConfig,
  ...reactQuery.configs['flat/recommended'],
  {
    plugins: {
      'react-compiler': reactCompiler,
    },
    rules: {
      'react-compiler/react-compiler': 'error',
    },
  },
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"]
  }
];
