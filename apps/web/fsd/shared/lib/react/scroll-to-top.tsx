'use client';
import { create } from 'zustand';

import ArrowTop from '@re/ui-kit/icons/arrow-top';
import { Button, ButtonProps } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

import { useScrollOffsetTrigger } from '~shared/hooks/use-scroll-offset-trigger';

const defaultWindowScroll = (window: Window) => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};

export const useSetHandleTopClickActions = create<{
  setHandleTopClick: (handleTopClick?: (window?: Window) => void) => void;
  handleTopClick?: ((window?: Window) => void) | undefined;
}>((set) => {
  return {
    handleTopClick: defaultWindowScroll,
    // @ts-ignore
    setHandleTopClick: (h) => set((v) => ({ ...v, handleTopClick: h || defaultWindowScroll })),
  };
});

export const ScrollToTop = (props: ButtonProps) => {
  const { className, ...rest } = props;
  const show = useScrollOffsetTrigger(1500);
  const { handleTopClick } = useSetHandleTopClickActions();

  const handleClick = () => {
    if (handleTopClick) {
      handleTopClick(window);
    }
  };

  return (
    <Button
      circle
      size="lg"
      variant="flat"
      color="secondary"
      id="scroll-to-top"
      {...rest}
      className={cn(
        'fixed bottom-16 left-4 z-[1000] opacity-0 transition-opacity md:bottom-8 md:left-8',
        {
          'opacity-100': show,
        },
        className
      )}
      onClick={handleClick}
    >
      <ArrowTop className="rotate-180" size={24} />
    </Button>
  );
};
