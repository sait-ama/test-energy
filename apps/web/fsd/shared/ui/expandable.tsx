'use client';

import { FC, memo, ReactNode } from 'react';
import useMeasure from 'react-use-measure';

import { ReText } from '@re/ui-kit/ui/text';

import { useIsomorphicEffect } from '~shared/hooks/use-isomorphic-effect';
import { useOpen } from '~shared/hooks/use-open';

import { LinkBase } from './link-base';

const ActionButton = ({ open, ...rest }) => {
  return (
    <LinkBase>
      <ReText asChild {...rest} size="sm">
        <button>{open ? 'Скрыть' : 'Больше'}</button>
      </ReText>
    </LinkBase>
  );
};

const renderActionsDefault = ({ open, toggle }) => <ActionButton open={open} onClick={toggle} />;

interface ExpandableProps {
  maxHeight: number;
  withGradient?: boolean;
  renderContent: (containerRef: (element: HTMLElement | SVGElement | null) => void) => ReactNode;
  renderActions?: (options: { open: boolean; toggle: () => void }) => ReactNode;
}

export const Expandable: FC<ExpandableProps> = memo((props) => {
  const {
    maxHeight,
    withGradient = false,
    renderContent,
    renderActions = renderActionsDefault,
  } = props;

  const [containerRef, { height }] = useMeasure();
  const [open, toggle] = useOpen(false);

  const shouldCut = height > maxHeight;

  const style = { maxHeight: shouldCut && open ? undefined : maxHeight, overflow: 'hidden' };

  useIsomorphicEffect(() => {
    if (shouldCut && open) close();
  }, [shouldCut]);

  const showGradient = !open && shouldCut && withGradient;

  return (
    <>
      <div className="relative" style={style}>
        {renderContent(containerRef)}
        {showGradient ? (
          <div className="to-secondary dark:to-background absolute bottom-0 left-0 z-10 h-1/3 w-full bg-gradient-to-b from-transparent"></div>
        ) : null}
      </div>
      {shouldCut ? renderActions({ open, toggle }) : null}
    </>
  );
});
