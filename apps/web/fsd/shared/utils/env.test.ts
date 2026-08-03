import { describe, expect, it } from 'vitest';

import { createPublicEnv, isBrowser, publicEnv } from './env';

describe('env utils', () => {
  it('createPublicEnv maps values from process.env', () => {
    const env = createPublicEnv({
      NODE_ENV: 'test',
      DOMAIN: 'example.com',
      GATEWAY_URL: 'https://api',
    } as any);
    expect(env.NODE_ENV).toBe('test');
    expect(env.DOMAIN).toBe('example.com');
    expect(env.GATEWAY_URL).toBe('https://api');
  });

  it('publicEnv reads from process.env on server', () => {
    process.env.NODE_ENV = 'test';
    expect(publicEnv('NODE_ENV')).toBe('test');
  });

  it('isBrowser false without window.__ENV', () => {
    expect(isBrowser()).toBe(false);
  });
});
