import type { ComponentProps, ReactNode } from 'react';

import { createContext } from '@re/core/utils/create-context';
import Like from '@re/ui-kit/icons/like';
import { Button, ButtonProps } from '@re/ui-kit/ui/button';
import { Slot } from '@re/ui-kit/ui/slot';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import type { RatedStatus } from '~shared/api/models/post';
import { getInitialState } from '~shared/lib/like-dislike/model/store';
import { getAbbreviatedNumber } from '~shared/utils/get-abbreviated-number';

type State = { liked: boolean; disliked: boolean; score: number };
type ActionsProps<T extends { score: number; rated: RatedStatus | number | null }> = {
  children: ReactNode | ReactNode[];
  data: T;
  ref?: React.Ref<HTMLSpanElement> | undefined;
  asChild?: boolean;
} & ComponentProps<'span'>;
export const { Provider: VoteActionsProviders, useStore: useActionsDeps } = createContext<
  { onLike?: () => void; onDislike?: () => void },
  { onLike?: () => void; onDislike?: () => void }
>((v) => v);
export const { Provider: ActionsContextRootProvider, useStore: useActionsLikeDislikeData } =
  createContext<State, State>((v) => {
    return v;
  });
export const VoteActionsLikeDislikeRoot = <
  T extends { score: number; rated: RatedStatus | number | null },
>({
  children,
  data,
  className,
  asChild,
  ...props
}: ActionsProps<T>) => {
  const state = getInitialState(data.rated, data.score);
  const Wrapper = asChild ? Slot : 'span';
  return (
    <ActionsContextRootProvider value={state}>
      <Wrapper {...props} className={cn('flex items-center gap-1', className)}>
        {children}
      </Wrapper>
    </ActionsContextRootProvider>
  );
};
const defaultProcessFn = <T,>(v: T) => v;
const defaultMaxedProcessFn = (score: number) => Math.max(0, score);
export const VoteActionsLikeBase = ({
  withAbbreviated,
  negativeScoreAvailable,
  children,
}: {
  withAbbreviated?: boolean;
  negativeScoreAvailable?: boolean;
  children: (params: {
    onLike: (e: React.MouseEvent<HTMLButtonElement>) => void;
    liked: boolean;
    score: number | string;
  }) => ReactNode;
}) => {
  const liked = useActionsLikeDislikeData((v) => v.liked);
  const score = useActionsLikeDislikeData((v) => v.score);
  const onLike = useActionsDeps((v) => v.onLike);

  const handleLike = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onLike?.();
  };
  const processFn = withAbbreviated ? getAbbreviatedNumber : defaultProcessFn<number>;
  const postProcessFn = negativeScoreAvailable ? defaultProcessFn<number> : defaultMaxedProcessFn;
  const computedScore = processFn(postProcessFn(score));
  return children({ score: computedScore, liked, onLike: handleLike });
};
export const VoteActionsLikeButtonBase = ({
  className,
  score,
  liked,
  onLike,
  ...props
}: ButtonProps & {
  score: number | string;
  liked: boolean;
  onLike: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) => {
  return (
    <Button
      variant="secondary"
      className={cn(
        'border-border bg-secondary/80 inline-flex items-center gap-2 rounded-md border px-4 transition-colors duration-300',
        className
      )}
      size="sm"
      {...props}
      onClick={onLike}
    >
      <Like
        className={cn(
          { 'fill-current text-red-700': liked },
          'size-4 transition-colors duration-300'
        )}
      />
      <ReText size="xs" weight="semibold">
        {score}
      </ReText>
    </Button>
  );
};
export const VoteActionsLike = ({
  className,
  withAbbreviated,
  negativeScoreAvailable,
  ...props
}: ButtonProps & { withAbbreviated?: boolean; negativeScoreAvailable?: boolean }) => {
  return (
    <VoteActionsLikeBase
      withAbbreviated={withAbbreviated}
      negativeScoreAvailable={negativeScoreAvailable}
    >
      {(actionsProps) => (
        <VoteActionsLikeButtonBase
          className={cn(className, '')}
          {...{ ...actionsProps, ...props }}
        />
      )}
    </VoteActionsLikeBase>
  );
};
