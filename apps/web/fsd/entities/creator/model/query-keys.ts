import { queryKit } from '~shared/api/react-query';

export namespace CreatorQueryKeys {
  // export const getCreator = (id: string) => ['creator', id];
  export const getCreator = queryKit.createQueryKey((variables) => [
    'creator',
    { authDepend: false, ...variables },
  ]);
}
