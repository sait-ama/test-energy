import Ordering from '@re/ui-kit/icons/ordering';
import { Button, ButtonProps } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

export const SelectOrderingFilterButton = (props: ButtonProps & { isReversed?: boolean }) => {
  const { className, isReversed, children, ...rest } = props;
  return (
    <Button
      variant="ghost"
      className={cn('bg-input line-clamp-1 flex justify-start pr-10 lg:w-[181px] lg:max-w-[181px]')}
      {...rest}
    >
      <span className="line-clamp-1">{children || 'По популярности'}</span>
      <Ordering
        className={cn(
          'absolute top-1 right-1 size-4 -translate-x-1/2 translate-y-1/2 transition duration-300',
          isReversed && 'rotate-180'
        )}
        aria-hidden="true"
      />
    </Button>
  );
};
