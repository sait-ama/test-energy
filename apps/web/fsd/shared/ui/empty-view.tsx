import type { FC, ReactNode } from 'react';

import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

export interface EmptyViewProps {
  emoji?: string;
  text?: ReactNode;
  height?: string;
  isEmpty?: boolean;
  children?: ReactNode;
  className?: string;
  emojiHidden?: boolean;
}

export const EmptyView: FC<EmptyViewProps> = (props) => {
  const {
    text = 'Нет результатов',
    emojiHidden = false,
    emoji = '🐋',
    isEmpty = true,
    children,
    height,
    className,
  } = props;

  return isEmpty ? (
    <div
      className={cn('flex w-full flex-col items-center justify-center', className)}
      style={{ height }}
    >
      {!emojiHidden && <ReText className="mb-2 text-[44px]">{emoji}</ReText>}
      {typeof text === 'string' ? (
        <ReText color="muted-foreground" align="center">
          {text}
        </ReText>
      ) : (
        text
      )}
    </div>
  ) : (
    children
  );
};
