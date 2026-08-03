import { ReactNode, useEffect, useMemo, useState } from 'react';

import { Button, ButtonProps } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import { ShortsFilters } from '~features/(moments)/shorts/ui/filters';
import { MomentSchema } from '~shared/api/models/inventory';
import { useIsClient } from '~shared/hooks/use-is-client';
import { TransitionableDrawer } from '~shared/lib/drawer/transitionable-drawer';
import { TestProps } from '~shared/lib/test/utils/test-props';
import { CommentsAsync } from '~widgets/activity/ui/comments.async';

import { ASIDE } from './model/constants';
import { ShortsAsideProvider, useShortsAside } from './model/context';

export const ShortsAsideRoot = ({ children }: { children: ReactNode }) => (
  <ShortsAsideProvider>{children}</ShortsAsideProvider>
);

export { useShortsAside };

export const ShortsAsideContent = ({ moment }: { moment?: MomentSchema | null }) => {
  const { state, close } = useShortsAside();
  const isClient = useIsClient();
  const [visualState, setVisualState] = useState<ASIDE | null>(null);

  useEffect(() => {
    if (state) {
      setVisualState(state);
    }
  }, [state]);

  const handleAnimationFinished = () => {
    setVisualState(null);
  };

  const [header, children] = useMemo((): readonly [ReactNode, ReactNode] => {
    if (!isClient) return [null, null] as const;

    switch (visualState) {
      case ASIDE.COMMENTS:
        return [
          <ReText key={0} size="lg" weight="semibold">
            Комментарии
          </ReText>,
          <CommentsAsync target={{ moment_id: moment?.id }} {...TestProps.id('moment-comments')} />,
        ] as const;
      case ASIDE.FILTERS:
        return [
          <ReText key={0} size="lg" weight="semibold">
            Фильтры
          </ReText>,
          <ShortsFilters />,
        ] as const;
      default:
        return [null, null] as const;
    }
  }, [visualState, moment]);

  if (!isClient) return null;

  return (
    <TransitionableDrawer
      open={!!state}
      overrideOverflow="hidden"
      onClose={close}
      onCloseAnimationFinished={handleAnimationFinished}
      header={header}
    >
      {children}
    </TransitionableDrawer>
  );
};

export type ShortsAsideTriggerProps = ButtonProps & {
  children: ReactNode;
  value: ASIDE;
};

export const ShortsAsideTrigger = ({ children, value, ...props }: ShortsAsideTriggerProps) => {
  const { toggle } = useShortsAside();

  return (
    <Button onClick={() => toggle(value)} {...props}>
      {children}
    </Button>
  );
};
