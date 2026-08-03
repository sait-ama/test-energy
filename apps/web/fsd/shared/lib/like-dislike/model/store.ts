import { LikeDislikeType, RatedStatus } from '~shared/api/models/post';

export interface State {
  liked: boolean;
  disliked: boolean;
  score: number;
}

type Action = { type: LikeDislikeType.LIKE } | { type: LikeDislikeType.DISLIKE };
export const getInitialState = (
  rated: RatedStatus | number | null | undefined,
  score: number | undefined
): State =>
  ({
    liked: rated === RatedStatus.LIKED,
    disliked: rated === RatedStatus.DISLIKED,
    score: score ?? 0,
  }) satisfies State;

export const likeDislikeReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case LikeDislikeType.LIKE: {
      const { liked: prevLiked, disliked, score } = state;
      const acc = prevLiked ? -1 : 1 + Number(disliked);
      return { liked: !prevLiked, disliked: false, score: score + acc };
    }
    case LikeDislikeType.DISLIKE: {
      const { disliked: prevDisliked, liked, score } = state;
      const acc = prevDisliked ? 1 : -1 - Number(liked);

      return { liked: false, disliked: !prevDisliked, score: score + acc };
    }
    default:
      return state;
  }
};
