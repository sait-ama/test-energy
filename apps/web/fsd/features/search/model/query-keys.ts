import { queryKit } from '~shared/api/react-query';

export namespace SearchKeys {
  export const fallback = queryKit.createQueryKey((variables) => ['search', variables]);
}
