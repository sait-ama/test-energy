import { CreateClientConfig } from './generated/client';

export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  fetch: global.fetch,
  baseUrl: process.env.GATEWAY_URL,
});
