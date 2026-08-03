import { removeUnusedQueryParams } from '@re/core/lib/query-params';
import { type SingleParserBuilder, useQueryStates } from 'nuqs';

import { noopObject } from '~shared/utils/noop';

/**
 * Common query params shape extended by domain-specific fields.
 */
export type BaseQueryParams<TFields extends Record<string, unknown> = {}> = TFields;

/**
 * Combines incoming query with provided defaults ensuring
 * defaults are non-nullable for their keys.
 */
export type QueryWithDefaults<
  TQuery extends BaseQueryParams<Record<string, unknown>>,
  TDefaults extends Partial<TQuery>,
> = TQuery & { [K in keyof TDefaults]: NonNullable<TDefaults[K]> };
type NullableFieldType<T extends Record<string, unknown>> = {
  [key in keyof T]: T[key] | null;
};
/**
 * Configuration for query store factory.
 */
export type QueryStoreConfig<
  TFields extends Record<string, unknown>,
  TDefaults extends Partial<TFields> = Partial<TFields>,
> = {
  /** Prefix added to query keys to avoid collisions between multiple stores on the same page */
  prefix: string;
  /** Default values applied when corresponding keys are absent from the URL */
  defaultValues?: TDefaults;
  /** nuqs-compatible parsers describing how each query param is parsed/serialized */
  parsers: {
    [K in keyof TFields]: SingleParserBuilder<NonNullable<NonNullable<TFields>[K]>>;
  };
  options?: {
    /** If true, values equal to defaults will be removed from the URL on update */
    removeDefaultsFromQuery?: boolean;
  };
};

/**
 * Creates a hook that binds typed query params to the URL via nuqs.
 * - Applies defaults
 * - Adds a prefix to avoid collisions
 * - Provides helpers to reset to defaults
 */
export function createQueryStore<
  TFields extends Record<string, unknown>,
  TDefaults extends Partial<TFields> = Partial<TFields>,
>(config: QueryStoreConfig<TFields, TDefaults>) {
  const { prefix, defaultValues, parsers, options = {} } = config;
  const { removeDefaultsFromQuery = false } = options;

  return (params?: Pick<Partial<QueryStoreConfig<TFields, TDefaults>>, 'parsers'>) => {
    const prefixedParsers = Object.fromEntries(
      Object.entries({ ...parsers, ...(params?.parsers ?? {}) }).map(([k, v]) => [
        `${prefix}_${k}`,
        v,
      ])
    ) as Parameters<typeof useQueryStates>[0];

    const [rawParams, setRawParams] = useQueryStates(prefixedParsers);

    // Parse rawParams → strip prefix back to internal typed keys
    const queryFromUrl = Object.entries(rawParams).reduce((acc, [key, value]) => {
      if (key.startsWith(`${prefix}_`)) {
        const cleanKey = key.slice(prefix.length + 1) as keyof TFields;
        acc = { ...acc, [cleanKey]: value } as Partial<TFields>;
      }
      return acc;
    }, {} as Partial<TFields>);

    const query = removeUnusedQueryParams(
      {
        ...defaultValues,
        ...queryFromUrl,
      },
      2,
      false
    ) as QueryWithDefaults<TFields, TDefaults>;

    /**
     * Updates query params in the URL.
     * - Optionally removes values equal to defaults
     */
    const _setQuery = async (
      updates: NullableFieldType<Partial<TFields>>,
      onChange: typeof setRawParams
    ) => {
      let processedUpdates: NullableFieldType<Partial<TFields>> = { ...updates };
      if (removeDefaultsFromQuery) {
        const keys = Object.keys(updates) as Array<keyof TFields>;
        processedUpdates = keys.reduce((acc, key) => {
          const value = updates[key];
          acc = { ...acc, [key]: value } as Partial<TFields>;
          return acc;
        }, {} as Partial<TFields>);
      }

      const prefixedUpdates: Record<string, unknown> = {};
      for (const key of Object.keys(processedUpdates) as Array<keyof typeof processedUpdates>) {
        prefixedUpdates[`${prefix}_${String(key)}`] = processedUpdates[key];
      }
      await onChange(prefixedUpdates as Partial<TFields>);
    };
    const setQueryAsync = async (fields: NullableFieldType<Parameters<typeof _setQuery>[0]>) => {
      await _setQuery(fields, setRawParams);
    };

    const setQuery = (updates: NullableFieldType<Partial<TFields>>) => {
      _setQuery(updates, setRawParams);
    };

    /**
     * Resets all keys present in defaults to undefined (removes them from URL).
     */
    const resetQuery = () => {
      const keys = Object.keys(defaultValues ?? noopObject) as Array<keyof typeof defaultValues>;
      const resetUpdates = keys.reduce(
        (acc, k) => ({ ...acc, [k]: undefined }),
        {} as Partial<TFields>
      );
      setQuery(resetUpdates);
    };

    return {
      query,
      setQuery,
      setQueryAsync,
      resetQuery,
    };
  };
}

export type OrderKey<TFields extends string | string[]> = TFields extends string
  ? TFields
  : TFields[number];

export type GetWithoutDash<T extends string> = T extends `-${infer R}` ? R : T;

/**
 * Returns field name portion from an ordering string (e.g. '-name' → 'name').
 */
const getOrderField = <T extends string>(ordering: T): GetWithoutDash<T> => {
  return (ordering.startsWith('-') ? ordering.slice(1) : ordering) as GetWithoutDash<T>;
};

/**
 * Returns direction from an ordering string (e.g. '-name' → 'desc').
 */
const getOrderDirection = (ordering: string): 'asc' | 'desc' =>
  ordering.startsWith('-') ? 'desc' : 'asc';

/**
 * Creates an ordering string from field and direction.
 */
const createOrdering = (field: string, direction: 'asc' | 'desc'): string =>
  direction === 'desc' ? `-${field}` : field;

/**
 * Configuration for query store with ordering that requires ordering in defaults
 */
export interface QueryStoreConfigWithOrdering<
  TFields extends Record<string, unknown>,
  TOrdering extends string,
  TDefaults extends Required<
    Pick<
      TFields & {
        ordering?: OrderKey<TOrdering>;
      },
      'ordering'
    >
  > &
    Partial<
      TFields & {
        ordering?: OrderKey<TOrdering>;
      }
    >,
> extends QueryStoreConfig<
    TFields & {
      ordering?: OrderKey<TOrdering>;
    },
    TDefaults
  > {}

/**
 * Enhanced query store with ordering, pagination, and count functionality
 * Guarantees that ordering always has a valid value based on defaults
 */
export function createQueryStoreWithOrdering<
  TFields extends Record<string, unknown>,
  TOrdering extends string,
  TDefaults extends Required<
    Pick<
      TFields & {
        ordering?: OrderKey<TOrdering>;
      },
      'ordering'
    >
  > &
    Partial<
      TFields & {
        ordering: OrderKey<TOrdering>;
      }
    >,
>(config: QueryStoreConfigWithOrdering<TFields, TOrdering, TDefaults>) {
  const baseStore = createQueryStore(config);

  return (
    params?: Pick<Partial<QueryStoreConfigWithOrdering<TFields, TOrdering, TDefaults>>, 'parsers'>
  ) => {
    const base = baseStore(params);
    const { query, setQuery } = base;

    const getOrderingValue = (): OrderKey<TOrdering> => {
      return query.ordering as OrderKey<TOrdering>;
    };

    /**
     * Returns current ordering field (without '-') - ALWAYS DEFINED
     * due to required default value for ordering
     */
    const getCurrentOrderField = (): GetWithoutDash<OrderKey<TOrdering>> => {
      const ordering = getOrderingValue();
      return getOrderField(ordering);
    };

    /**
     * Returns current ordering direction - ALWAYS DEFINED
     * due to required default value for ordering
     */
    const getCurrentOrderDirection = (): 'asc' | 'desc' => {
      const ordering = getOrderingValue();
      return getOrderDirection(ordering);
    };

    const setOrdering = (field: OrderKey<TOrdering>, direction: 'asc' | 'desc' = 'desc') => {
      const ordering = createOrdering(field, direction);
      setQuery({ ordering } as Partial<
        TFields & {
          ordering?: OrderKey<TOrdering>;
        }
      >);
    };

    const toggleOrdering = (field: OrderKey<TOrdering>) => {
      const currentField = getCurrentOrderField();
      const currentDirection = getCurrentOrderDirection();

      const newDirection =
        currentField === field ? (currentDirection === 'desc' ? 'asc' : 'desc') : 'desc';
      setOrdering(field, newDirection);
    };

    return {
      ...base,
      getOrderField: getCurrentOrderField,
      getOrderDirection: getCurrentOrderDirection,
      setOrdering,
      toggleOrdering,
    };
  };
}
