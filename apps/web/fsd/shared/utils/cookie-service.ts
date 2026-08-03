import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import type { NextRequest, NextResponse } from 'next/server';

import { deleteCookie, getCookie, getCookies, setCookie } from 'cookies-next';
import dayjs from 'dayjs';
import type { IncomingMessage, ServerResponse } from 'http';

import { publicEnv } from './env';

export interface CookieOptions {
  expires: Date;
  maxAge: number; // in seconds
  secure: boolean;
  path: string;
  domain: string;
  sameSite: boolean | 'lax' | 'none' | 'strict';
  httpOnly: boolean;
}

export type CookieObject = Record<string, string> | Partial<Record<string, string>>;

type NextCookies = Promise<ReadonlyRequestCookies>;
export type Ctx =
  | {
      req?: Request | NextRequest;
      res?: Response | NextResponse;
      domain?: string;
    }
  | {
      res?: ServerResponse;
      req?: IncomingMessage & {
        cookies?: CookieObject;
      };
      domain?: string;
    }
  | {
      domain?: string;
      cookies: NextCookies;
    };

export const defaultOptions: Partial<CookieOptions> = {
  expires: dayjs().add(1, 'year').toDate(),
  secure: process.env.NODE_ENV !== 'development',
};

/**
 * - Mind the default options.
 * - If value to be set is object, pass it as is.
 * - No need to apply uri decode/encode and json stringify, it may cause issues.
 * - httpOnly option is server-side only
 */
export class CookieService {
  static get(key: string, ctx?: Ctx): string | undefined {
    const resolvedOptions: Ctx = { ...ctx };

    if (publicEnv('NODE_ENV') === 'production') {
      resolvedOptions.domain = `.${publicEnv('DOMAIN')}`;
    }

    return getCookie(key, resolvedOptions);
  }

  static getAll(ctx?: Ctx): CookieObject {
    const resolvedOptions: Ctx = { ...ctx };

    if (publicEnv('NODE_ENV') === 'production') {
      resolvedOptions.domain = `.${publicEnv('DOMAIN')}`;
    }

    return getCookies(resolvedOptions);
  }

  static set<T>(key: string, value: T, options?: Partial<CookieOptions> & Partial<Ctx>) {
    const resolvedOptions = { ...defaultOptions, ...options };

    if (publicEnv('NODE_ENV') === 'production') {
      resolvedOptions.domain = `.${publicEnv('DOMAIN')}`;
    }

    setCookie(key, value, resolvedOptions);
  }

  static delete(
    key: string,
    options?: Partial<Pick<CookieOptions, 'path' | 'domain'>> & Partial<Ctx>
  ) {
    deleteCookie(key, options);
    deleteCookie(key, { ...options, domain: publicEnv('DOMAIN') }); // until we do not migrate user data
  }
}

interface StateStorage {
  getItem: (name: string) => string | null | Promise<string | null>;
  setItem: (name: string, value: string) => void | Promise<void>;
  removeItem: (name: string) => void | Promise<void>;
}

export const cookieStorage: StateStorage = {
  getItem: (key) => {
    return CookieService.get(key) ?? null;
  },
  setItem: (storeKey, value) => {
    CookieService.set(storeKey, value);
  },
  removeItem: (key) => {
    CookieService.delete(key);
  },
};
