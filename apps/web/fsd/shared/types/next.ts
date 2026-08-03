import type { StaticImport } from 'next/dist/shared/lib/get-img-props';

export interface NextPageParams<
  TParams extends Record<string, string | string[] | undefined> | null = Record<
    string,
    string | string[] | undefined
  > | null,
  SParams extends Record<string, string | string[] | undefined> | undefined | null =
    | Record<string, string | string[] | undefined>
    | undefined
    | null,
> {
  params: Promise<TParams>;
  segment: Promise<string>;
  searchParams: Promise<SParams>;
}

export const isStaticImport = (v: unknown): v is StaticImport => {
  if (typeof v !== 'object') return false;
  if (Array.isArray(v)) return false;
  if (!v) return false;

  if ('default' in v) return true;
  if ('src' in v && 'width' in v && 'height' in v) return true;

  return false;
};
