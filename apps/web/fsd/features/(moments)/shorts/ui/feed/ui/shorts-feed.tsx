'use client';

import { memo, useEffect, useMemo } from 'react';

import { motion } from 'motion/react';

import { MomentSchema } from '~shared/api/models/inventory';
import { EmptyView } from '~shared/ui/empty-view';

import { useScroll } from '../model';

export type ShortsVirtualFeedProps = {
  moments: MomentSchema[];
  Item: React.ComponentType<{ moment: MomentSchema }>;
  onEndReached?: () => void;
  EmptyView?: React.ComponentType;
  onIndexChange?: (index: number) => void;
};

const DefaultEmptyView = () => {
  return <EmptyView className="h-[80vh]" />;
};

export const ShortsFeed = memo((props: ShortsVirtualFeedProps) => {
  const { moments, Item, onEndReached, onIndexChange, EmptyView = DefaultEmptyView } = props;
  const { ref, index, containerProps, itemProps } = useScroll();

  useEffect(() => {
    onIndexChange?.(index);
  }, [index, onIndexChange]);

  useEffect(() => {
    if (index >= moments.length - 2) {
      onEndReached?.();
    }
  }, [index, moments.length, onEndReached]);

  const feedContent = useMemo(() => {
    return moments.map((moment, momentIndex) => {
      const props = itemProps(momentIndex);
      return (
        <motion.div
          key={props.key}
          style={props.style}
          className="relative flex w-full items-center justify-center"
        >
          <Item moment={moment} />
        </motion.div>
      );
    });
  }, [moments, Item]);

  if (!moments.length) return <EmptyView />;

  return (
    <div
      ref={ref}
      className="relative h-screen w-full overflow-hidden"
      style={{ touchAction: 'pan-y' }}
    >
      <motion.div className="relative" {...containerProps}>
        {feedContent}
      </motion.div>
    </div>
  );
});
