import type { DefaultError } from '@tanstack/query-core';

import { api } from '~shared/api/$api';
import { LikeDislikeType, RatedStatus, RatedStatusType } from '~shared/api/models/post';
import { useOptimisticMutation } from '~shared/api/react-query';

import { getInitialState, likeDislikeReducer, State } from './store';

export type VoteType =
  | 'collection'
  | 'post'
  | 'comment'
  | 'similar'
  | 'moment'
  | 'feedback'
  | 'chapters'
  | 'card';
export type Response = { results: { rated: RatedStatusType } };
const endpoint = <T extends string = VoteType>(type: T) => `/api/activity/vote-${type}/`;
export interface EntityFragmentSchema {
  id: number;
  score: number;
  rated: RatedStatusType | null;
}
type Actor<T extends EntityFragmentSchema = EntityFragmentSchema> = {
  additional?: {
    onMutate?: ({
      type,
      entityId,
      getState,
    }: {
      type: LikeDislikeType;
      entityId: number;
      getState: (entity: T) => { rated: RatedStatusType | null; score: number };
    }) => void;
  };
};

type StateHandler<TEntityFragmentData extends EntityFragmentSchema = EntityFragmentSchema> = (
  entity: TEntityFragmentData
) => State;
export type RequestSchema<T extends string = VoteType> = Record<T, number> & {
  type: LikeDislikeType;
};
type Formatter<TEntityFragmentData extends EntityFragmentSchema = EntityFragmentSchema> = (
  entity: TEntityFragmentData
) => {
  score: number;
  rated: RatedStatusType;
};
export const getMutationVote =
  <
    T extends string = VoteType,
    TEntityFragmentData extends EntityFragmentSchema = EntityFragmentSchema,
  >({
    voteType,
    additional,
  }: { voteType: T } & Actor<TEntityFragmentData>) =>
  () => {
    return useOptimisticMutation<Response, DefaultError, RequestSchema<T>, Formatter<T>>({
      mutationFn: async (data) => {
        return await api.post<Response, RequestSchema<T>>(endpoint<T>(voteType), data);
      },
      onMutate: (request) => {
        const type = request.type;
        const entityId = request?.[voteType];
        const getState: StateHandler<TEntityFragmentData> = (entity) =>
          likeDislikeReducer(getInitialState(entity.rated, entity.score), { type });
        const getFormattedState = (
          entity: TEntityFragmentData
        ): { score: number; rated: RatedStatusType | null } => {
          const state = getState(entity);
          return {
            score: state.score,
            rated: state.liked ? RatedStatus.LIKED : state.disliked ? RatedStatus.DISLIKED : null,
          };
        };
        additional?.onMutate?.({ type, entityId, getState: getFormattedState });
        return getFormattedState;
      },
    });
  };
