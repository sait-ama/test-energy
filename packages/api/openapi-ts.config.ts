import { defaultPaginationKeywords, defaultPlugins, defineConfig } from '@hey-api/openapi-ts';
import { config } from 'dotenv';

config();
const path = process.env?.['OPEN_API_PATH'] || 'https://stage.remanga.org/api/schema/';
export default defineConfig({
  input: {
    path,
  },
  parser: {
    pagination: {
      keywords: [...defaultPaginationKeywords, '/api/v2/users/badges/{badge_id}/owners/', 'owners'],
    },
  },
  output: {
    indexFile: false,

    path: 'generated',
  },
  plugins: [
    ...defaultPlugins,
    {
      exportFromIndex: false,
      enums: false,
      readOnlyWriteOnlyBehavior: 'off',
      name: '@hey-api/typescript',
    },
    {
      name: '@tanstack/react-query',
      //@ts-ignore
      infiniteQueries: true,
      infiniteQueryParam: 'page',
      queryOptions: true,
      infiniteQueryOptions: true,
      infiniteQueryKeys: true,
    },

    {
      name: '@hey-api/client-next',
      runtimeConfigPath: '../fetch-config',
      exportFromIndex: false,
    },

    // {
    //   name: '@hey-api/sdk',
    //   validator: true,
    // },
    {
      name: 'zod',
      compatibilityVersion: 3,
      exportFromIndex: false,
    },
  ],
});
