import { EndpointMeta } from '~shared/api/api-toolkit';
import { queryKit } from '~shared/api/react-query';

export namespace ActivityKeys {
  // todo
  export const activity = <T, K>(variables: EndpointMeta<T, K>) =>
    queryKit.createQueryKey<T, K>((vars) => ['activity', vars])(variables);
}
