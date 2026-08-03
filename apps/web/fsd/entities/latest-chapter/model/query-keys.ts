import { EndpointMeta } from '~shared/api/api-toolkit';
import { queryKit } from '~shared/api/react-query';

export namespace LatestChaptersKeys {
  // todo

  export const list = <T, K>(variables: EndpointMeta<T, K>) =>
    queryKit.createQueryKey<T, K>((vars) => ['latest-chapters', vars])(variables);
}
