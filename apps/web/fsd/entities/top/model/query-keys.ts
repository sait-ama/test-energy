import { queryKit } from '~shared/api/react-query';

export namespace TopKeys {
  export const tabs = queryKit.createQueryKey(() => ['tabs']);
}
