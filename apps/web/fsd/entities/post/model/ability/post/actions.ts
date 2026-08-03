import { AbilityFn } from '~entities/post/model/ability/types';
import { Features } from '~shared/config/feature-flags';

import type {
  BanParamsType,
  DeleteParamsType,
  EditParamsType,
  PinParamsType,
  ReadParamsType,
} from './types';

export const canReadPost: AbilityFn<ReadParamsType> = ({ features }) =>
  !!features?.[Features.FORUM];
export const canWritePost: AbilityFn<EditParamsType> = ({
  sessionId,
  isStaff,
  postAuthorId,
  isSuper,
}) => (!!sessionId && postAuthorId === sessionId) || isStaff || isSuper;
export const canBanPost: AbilityFn<BanParamsType> = ({ isStaff, isSuper }) => isSuper || isStaff;
export const canRemovePost: AbilityFn<DeleteParamsType> = ({
  sessionId,
  postAuthorId,
  isSuper,
  postDeleted,
  isStaff,
}) => (!!sessionId && postAuthorId === sessionId && !postDeleted) || isStaff || isSuper;

export const canPinPost: AbilityFn<PinParamsType> = ({ isStaff, isSuper }) => isStaff || isSuper;
