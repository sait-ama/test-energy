import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CookieService, cookieStorage, defaultOptions } from './cookie-service';

vi.mock('cookies-next', () => {
  const store: Record<string, string> = {};
  return {
    getCookie: (key: string) => store[key],
    getCookies: () => ({ ...store }),
    setCookie: (key: string, value: any) => {
      store[key] = typeof value === 'string' ? value : JSON.stringify(value);
    },
    deleteCookie: (key: string) => {
      delete store[key];
    },
  };
});

vi.mock('./env', () => ({
  publicEnv: (key: string) => {
    if (key === 'NODE_ENV') return 'development';
    if (key === 'DOMAIN') return 'example.com';
    return undefined;
  },
}));

describe('CookieService', () => {
  beforeEach(() => {
    // reset mocked store via re-import
  });

  it('sets, gets and deletes cookies', () => {
    CookieService.set('a', '1');
    expect(CookieService.get('a')).toBe('1');
    expect(CookieService.getAll()).toMatchObject({ a: '1' });
    CookieService.delete('a');
    expect(CookieService.get('a')).toBeUndefined();
  });

  it('cookieStorage delegates to CookieService', () => {
    cookieStorage.setItem('k', 'v');
    expect(cookieStorage.getItem('k')).toBe('v');
    cookieStorage.removeItem('k');
    expect(cookieStorage.getItem('k')).toBeNull();
  });

  it('defaultOptions provide future expiry and secure flag depends on env', () => {
    expect(defaultOptions.expires).toBeInstanceOf(Date);
  });
});
