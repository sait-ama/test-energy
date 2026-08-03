export type CommonParams = {
  bySessionProps: {
    sessionId?: number | undefined;
    ownerId?: number | undefined;
  };
};
export namespace CollectionAbilityActions {
  export const read = () => true;
  export const edit = ({
    bySessionProps: { ownerId, sessionId },
  }: Pick<CommonParams, 'bySessionProps'>) => !!sessionId && !!ownerId && sessionId === ownerId;
  export const remove = ({
    bySessionProps: { ownerId, sessionId },
  }: Pick<CommonParams, 'bySessionProps'>) => !!sessionId && !!ownerId && sessionId === ownerId;
  export const create = ({ bySessionProps: { sessionId } }: Pick<CommonParams, 'bySessionProps'>) =>
    !!sessionId;
  export const like = ({ bySessionProps: { sessionId } }: Pick<CommonParams, 'bySessionProps'>) =>
    !!sessionId;
  export const tryLike = () => true;
  export const share = () => true;
}
