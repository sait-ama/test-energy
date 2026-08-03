import { useSwipeable } from 'react-swipeable';

import { Tabs, TabsList, TabsTrigger } from '@re/ui-kit/ui/tabs';

export { Tabs, TabsList, TabsTrigger };

interface GetNewValueOptions {
  variants: any[];
  value: any;
  direction?: string;
  loop: boolean;
}

const getNewValue = ({ variants, value, direction, loop }: GetNewValueOptions) => {
  const index = variants.indexOf(value);

  const newIndex = direction === 'left' ? index + 1 : index - 1;

  if (newIndex >= variants.length || newIndex < 0) return value;

  return variants[newIndex];
};

export interface UseSwipeableTabsOptions {
  variants: string[];
  value: string;
  loop?: boolean;
  enabled?: boolean;
  onChange: (options: { value: string; action: 'prev' | 'next' }) => void;
}
export const useSwipeableTabs = ({
  variants,
  value,
  onChange,
  loop = false,
  enabled = true,
}: UseSwipeableTabsOptions) => {
  const handlers = useSwipeable({
    onSwipedLeft: () =>
      enabled &&
      onChange({
        value: getNewValue({ variants, value, direction: 'left', loop }),
        action: 'next',
      }),
    onSwipedRight: () =>
      enabled &&
      onChange({
        value: getNewValue({ variants, value, direction: 'right', loop }),
        action: 'prev',
      }),
  });

  return handlers;
};
