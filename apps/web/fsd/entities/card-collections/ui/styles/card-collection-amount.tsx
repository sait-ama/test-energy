import { ComponentProps } from 'react';

import { ReText } from '@re/ui-kit/ui/text';

interface CardCollectionNameProps extends Omit<ComponentProps<typeof ReText>, 'children'> {
  currentAmount: number;
  amount: number;
}

export const CardCollectionAmount = ({
  currentAmount,
  amount,
  className,
  ...props
}: CardCollectionNameProps) => {
  return (
    <ReText className={className} size="sm" color="muted-foreground" {...props}>
      {`(${currentAmount}/${amount})`}
    </ReText>
  );
};
