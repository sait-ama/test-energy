import { createQueryKey } from '@re/api/generated/@tanstack/exports-core'; // it's required to import

// it's required to import
import '@tanstack/react-query';

declare global {
  interface QueryKeyExtraArgs<
    P extends Record<string, NumberIsomorphic>,
    Q extends Record<string, NumberIsomorphic>,
  > {
    authDepend?: boolean;
    params?: P;
    query?: Q;
  }
}
// declare module '@tanstack/query-core' {
//     type QueryKey = readonly [string, QueryKeyExtraArgs];
// }

// declare module '@tanstack/query-core' {
//     type QueryKey = readonly [primaryKey: string, params?: QueryKeyExtraArgs];
// }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AppQueryKey<P = any, Q = any, U extends string = string> = [
  primaryKey: U,
  params?: QueryKeyExtraArgs<P, Q>,
];

declare module '@tanstack/react-query' {
  interface Register {
    queryKey: AppQueryKey | ReturnType<typeof createQueryKey>;
    defaultError: BackendValidationError;
  }
}
