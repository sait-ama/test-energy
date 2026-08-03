import { TDataShape } from './generated/client';
import type { Options as _Options } from './generated/sdk.gen';
import { client } from './plugins/next-fetcher';

type GenOptions<T extends TDataShape = TDataShape> = {} & _Options<T, true>;
type Options<TData, ThrowOnError extends boolean = true> = {
  client?: typeof client;
  throwOnError?: ThrowOnError;
} & TData;
type NoUndefined<T> = T extends undefined ? never : T;

/**
 * Factory to build preconfigured data decorators with defaults (e.g., client, headers).
 * Result uses throwOnError-only strategy and returns non-undefined data.
 */
export function createApiDataDecorator<TCommon extends GenOptions>(
  defaults?: TCommon & { client?: typeof client }
) {
  return function getApiDataWithDefaults<TData, TResponse>(
    fn:
      | ((o: Options<TData, true>) => Promise<{ data: TResponse }>)
      | (<T extends boolean = boolean>(
          o: Options<TData, T>
        ) => T extends true ? Promise<{ data: TResponse }> : unknown)
  ): (
    params: Omit<Options<TData, boolean>, 'throwOnError'> &
      Omit<TCommon, 'client'> & { client?: typeof client }
  ) => Promise<NoUndefined<TResponse>> {
    return async (
      params: Omit<Options<TData, boolean>, 'throwOnError'> &
        Omit<TCommon, 'client'> & {
          client?: typeof client;
        }
    ): Promise<NoUndefined<TResponse>> => {
      const call = fn as <T extends boolean = boolean>(
        o: Options<TData, T>
      ) => T extends true ? Promise<{ data: TResponse }> : unknown;
      const mergedClient =
        (params as { client?: typeof client }).client ??
        (defaults as { client?: typeof client } | undefined)?.client ??
        client;
      const result = await call<true>({
        ...(defaults as unknown as Omit<TCommon, 'client'>),
        ...(params as unknown as TData & Omit<TCommon, 'client'>),
        throwOnError: true,
        client: mergedClient,
      } as Options<TData & TCommon, true>);
      return result.data as NoUndefined<TResponse>;
    };
  };
}
