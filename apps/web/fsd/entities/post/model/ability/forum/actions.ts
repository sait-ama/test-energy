import { AbilityFn } from '~entities/post/model/ability/types';
import { Features } from '~shared/config/feature-flags';

import type { CreateParamsType, ReadParamsType } from './types';

export const canReadPostsFeed: AbilityFn<ReadParamsType> = ({ features }) =>
  !!features?.[Features.FORUM];
export const canCreatePost: AbilityFn<CreateParamsType> = ({ sessionId }) => !!sessionId;
