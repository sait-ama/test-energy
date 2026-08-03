import type { FeaturesFlagParams, PostAuthorUserId } from '~entities/post/model/ability/types';

import { SessionParams } from '../types';

//todo interface dosn't allow as record
export interface EditParamsType extends SessionParams {
  postAuthorId: PostAuthorUserId;
}
export interface BanParamsType extends SessionParams {}
export interface DeleteParamsType extends SessionParams {
  postAuthorId: PostAuthorUserId;
  postDeleted: boolean;
}
export interface PinParamsType extends Pick<SessionParams, 'isSuper' | 'isStaff'> {}

export interface ReadParamsType extends FeaturesFlagParams {}

export type AllParamsType = EditParamsType &
  BanParamsType &
  DeleteParamsType &
  ReadParamsType &
  PinParamsType;
