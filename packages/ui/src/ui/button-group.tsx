import { Children, cloneElement, ReactElement, RefAttributes } from 'react';

import { ButtonProps } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

interface ButtonGroupProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  children: ReactElement<ButtonProps>[];
}

export const ButtonGroup = ({
  className,
  orientation = 'horizontal',
  children,
  ref,
}: ButtonGroupProps & RefAttributes<HTMLDivElement>) => {
  const totalButtons = Children.count(children);
  const isHorizontal = orientation === 'horizontal';
  const isVertical = orientation === 'vertical';

  return (
    <div
      ref={ref}
      className={cn(
        'flex',
        {
          'flex-col': isVertical,
          'w-fit': isVertical,
        },
        className
      )}
    >
      {Children.map(children, (child, index) => {
        const isFirst = index === 0;
        const isLast = index === totalButtons - 1;

        return cloneElement(child, {
          className: cn(
            {
              'rounded-l-none': isHorizontal && !isFirst,
              'rounded-r-none': isHorizontal && !isLast,
              'border-l-0': isHorizontal && !isFirst,

              'rounded-t-none': isVertical && !isFirst,
              'rounded-b-none': isVertical && !isLast,
              'border-t-0': isVertical && !isFirst,
            },
            child.props.className
          ),
        });
      })}
    </div>
  );
};
