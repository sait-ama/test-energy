import { cache } from 'react';

import deepmerge from 'deepmerge';

import type { ToolkitApiImpl, ToolkitApiOptions } from '~shared/api/api-toolkit';
import { ApiError, NetworkError } from '~shared/lib/error-handling/errors';
import { RewardSchema } from '~shared/lib/gift/announce-drop';
import { CookieService } from '~shared/utils/cookie-service';
import { publicEnv } from '~shared/utils/env';
import { UrlFormatter } from '~shared/utils/url-formatter';

export type HTTPRequestConfig = globalThis.RequestInit & {
  baseUrl?: string;
  responseTypeMethod?: 'blob' | 'json' | 'text';
  skipAuthorizationHeaders?: boolean;
};

interface HTTPResponseInterceptor {
  onFulfilled?: <T>(response: T) => T;
  onRejected?: (error: unknown) => Promise<void>;
}

type HTTPRequestInterceptor = (config: HTTPRequestConfig) => Promise<HTTPRequestConfig>;

interface HTTPOptions {
  interceptors?: {
    request?: HTTPRequestInterceptor[];
    response?: HTTPResponseInterceptor[];
  };
  defaultSettings?: HTTPRequestConfig;
}

export const { fetch: nextFetch, Request } = globalThis;

export const patchedFetch = cache(async (input: RequestInfo | URL, init?: RequestInit) => {
  const request = new Request(input, init);
  const stack = new Error().stack;

  try {
    // logger.log(`REQUEST ${extractUrl(input)} finished in ${(end - start).toFixed(2)} ms`);
    return await nextFetch(request);
  } catch (e: unknown) {
    if (e instanceof Error) {
      e.stack = stack;
      if (e.name === 'AbortError') throw e;
    }
    if (e.name === 'AbortError') throw e;
    throw new NetworkError(e?.message, { cause: e });
  }
});

globalThis.fetch = patchedFetch;

export class HTTP {
  private options: HTTPOptions;

  constructor(options: HTTPOptions) {
    this.options = options;
  }

  async method<T>(url: string, options?: HTTPRequestConfig): Promise<T> {
    const resolvedInitialConfig = deepmerge(this.options.defaultSettings ?? {}, options ?? {});

    let requestConfig: HTTPRequestConfig = resolvedInitialConfig;
    const interceptors = this.options.interceptors?.request ?? [];

    for (const interceptor of interceptors) {
      requestConfig = await interceptor(requestConfig);
    }
    const resolvedUrl = UrlFormatter.createUrl(
      resolvedInitialConfig.baseUrl || publicEnv('GATEWAY_URL'),
      url
    );

    const response = await patchedFetch(resolvedUrl, requestConfig);
    const method = requestConfig?.responseTypeMethod ?? 'json';
    const responseInterceptors = this.options.interceptors?.response ?? [];

    if (response.ok) {
      let promise;
      try {
        promise = await response[method]();
      } catch {
        promise = {};
      }

      promise = Promise.resolve(promise as T);

      const onFulfilledInterceptors = responseInterceptors
        .map((it) => it.onFulfilled)
        .filter(Boolean);

      for (const func of onFulfilledInterceptors) {
        promise = promise.then(func);
      }

      return promise as Promise<T>;
    }

    let promise = Promise.reject(response);

    const onRejectedInterceptors = responseInterceptors.map((it) => it.onRejected).filter(Boolean);

    for (const func of onRejectedInterceptors) {
      // @ts-ignore
      promise = promise.catch(func);
    }

    return promise as Promise<T>;
  }
}

const authRequestInterceptor: HTTPRequestInterceptor = async (config) => {
  let token: string | undefined;
  let preference: string | undefined;

  if (
    config?.skipAuthorizationHeaders ||
    config?.next?.revalidate ||
    config?.cache === 'force-cache'
  )
    return config;

  if (typeof window !== 'undefined') {
    token = CookieService.get('token');
    preference = CookieService.get('preference');
  } else {
    const { cookies } = require('next/headers');
    const cookieStore = await cookies();
    token = cookieStore.get('token')?.value;
    preference = cookieStore.get('preference')?.value;
  }

  config.headers = config.headers || {};

  if (token) {
    // @ts-ignore
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (preference) {
    // @ts-ignore
    config.headers.Preference = preference;
  }

  return config;
};

export class ErrorTransformer {
  static JSON = (options: { data: unknown; status: number }) => {
    const { data, status = 500 } = options;
    if (!data) {
      const error: BackendValidationError = {
        statusCode: status,
        detail: { server: 'Ошибка не содержит данных' },
      };

      return new ApiError(error, { cause: data });
    }

    if (typeof data !== 'object') {
      const error: BackendValidationError = {
        statusCode: status,
        detail: { server: JSON.stringify(data) },
      };

      return new ApiError(error, { cause: data });
    }

    if ('msg' in data) {
      const error: BackendValidationError = {
        statusCode: status,
        detail: { server: data.msg as string },
      };

      return new ApiError(error, { cause: data });
    }

    if ('detail' in data) {
      const detail = data.detail as
        | StringError
        | string
        | Record<string, StringError[]>
        | StringError[];
      const error: BackendValidationError = {
        statusCode: status,
        detail: Array.isArray(detail)
          ? { server: detail.map((it) => it.message).join(', ') }
          : typeof detail === 'string'
            ? { server: detail }
            : typeof detail.message === 'string'
              ? { server: detail.message }
              : Object.fromEntries(
                  Object.entries(detail).map(([key, value]) => [
                    key,
                    value.map((it: { message: string | object }) => it.message).join(', '),
                  ])
                ),
      };

      return new ApiError(error, { cause: data });
    }

    const error: BackendValidationError = {
      statusCode: status,
      detail: {
        server: 'Произошла непредвиденная ошибка',
      },
    };

    return new ApiError(error, { cause: options });
  };
  static DEFAULT = (options: { status: number; content: string }) => {
    const { status } = options;
    const content = options.content || 'Произошла непредвиденная ошибка';

    const error: BackendValidationError = {
      statusCode: status,
      detail: {
        server: content,
      },
    };

    return error;
  };
}

// Первой хендлер получает ответ, следующие - уже измененные данные
export const errorNormalizerResponseInterceptor: HTTPResponseInterceptor['onRejected'] = async (
  response: globalThis.Response
) => {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = (await response.json()) as unknown;
    const error = ErrorTransformer.JSON({ data, status: response.status });
    return Promise.reject(error);
  }

  const error = ErrorTransformer.DEFAULT({
    status: response.status,
    content: await response.text(),
  });

  return Promise.reject(error);
};

export const announceCardDropResponseInterceptor: HTTPResponseInterceptor['onFulfilled'] = <T>(
  response: T
) => {
  if (response && typeof response === 'object' && 'rewards' in response) {
    if (typeof window !== 'undefined') {
      const { announceDrop } = require('~shared/lib/gift/announce-drop');
      announceDrop(response.rewards as RewardSchema[]);
    }
  }

  return response;
};

export const http = new HTTP({
  interceptors: {
    // TODO: remove after backend team implement auth via token in cookie
    // Migrate to one source of truth - token with HTTP only flag
    request: [authRequestInterceptor],
    response: [
      {
        onFulfilled: announceCardDropResponseInterceptor,
        onRejected: errorNormalizerResponseInterceptor,
      },
    ],
  },
  defaultSettings: {
    headers: {
      'Content-Type': 'application/json',
      // credentials: 'include',
    },
  },
});

export const api = {
  get: <T>(url: string, opts?: ToolkitApiOptions) => http.method<T>(url, opts),
  post: <T, K>(url: string, data: K, opts?: ToolkitApiOptions) => {
    return http.method<T>(url, {
      ...opts,
      method: 'POST',

      body: data ? JSON.stringify(data) : null,
    });
  },
  put: <T, K>(url: string, data: K, opts?: ToolkitApiOptions) =>
    http.method<T>(url, {
      ...opts,
      method: 'PUT',
      body: data ? JSON.stringify(data) : null,
    }),
  delete: <T, K>(url: string, data?: K, opts?: ToolkitApiOptions) =>
    http.method<T>(url, {
      ...opts,
      method: 'DELETE',
      body: data ? JSON.stringify(data) : null,
    }),
  patch: <T, K>(url: string, data: K, opts?: ToolkitApiOptions) =>
    http.method<T>(url, {
      ...opts,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : null,
    }),
} satisfies ToolkitApiImpl;
