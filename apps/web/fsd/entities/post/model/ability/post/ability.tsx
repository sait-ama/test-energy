import { PropsWithChildren, useMemo } from 'react';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { Post } from '~entities/post/ui/post-card';
import { useSession } from '~shared/lib/session/use-session';

import * as AbilityFns from './actions';
import type { AllParamsType } from './types';

export const Abilities = {
  write: AbilityFns.canWritePost,
  read: AbilityFns.canReadPost,
  ban: AbilityFns.canBanPost,
  remove: AbilityFns.canRemovePost,
  pin: AbilityFns.canPinPost,
} as const;
export const getAvailableActions = (props: AllParamsType) => {
  return (Object.keys(Abilities) as (keyof typeof Abilities)[]).reduce(
    (acc, action) => {
      acc[action] = Abilities[action](props);
      return acc;
    },
    {} as Record<keyof typeof Abilities, boolean>
  );
};

export const usePostActions = () => {
  const postAuthorId = Post.useContext((v) => v?.post?.author_user?.id);
  const postDeleted = Post.useContext((v) => v?.post?.is_deleted);
  const sessionId = useSession((v) => v?.id);
  const isStaff = useSession((v) => !!v?.is_staff);
  const isSuper = useSession((v) => !!v?.is_superuser);
  const features = useSiteConfig((v) => v.features);
  const props: Parameters<typeof getAvailableActions>[0] = useMemo(() => {
    return {
      sessionId,
      postDeleted,
      features,
      isSuper,
      isStaff,
      postAuthorId,
    };
  }, [sessionId, features, isSuper, isStaff, postAuthorId, postDeleted]);
  return useMemo(() => getAvailableActions(props), [props]);
};
export const Can = ({
  action,
  children,
}: { action: keyof ReturnType<typeof getAvailableActions> } & PropsWithChildren) => {
  const can = usePostActions()[action];
  if (!can) return null;
  return <>{children}</>;
};
export const CanItem = <TAction extends keyof typeof Abilities>({
  action,
  params,
  children,
}: { action: TAction; params: Parameters<(typeof Abilities)[TAction]>[0] } & PropsWithChildren) => {
  // @ts-ignore
  const can = Abilities[action](params);
  if (!can) return null;
  return <>{children}</>;
};
