'use client';
import { ButtonProps } from 'react-day-picker';

import Share from '@re/ui-kit/icons/share';
import { Button } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

import { Routing } from '~shared/config/routing';
import { useShare } from '~shared/hooks/use-share';

export const useShareCard = <T extends { id: number }>(card?: T | null) => {
  const id = card?.id;
  const url = !id ? undefined : Routing.Card.id({ params: { id: id } });
  return useShare(url);
};

export const CardShare = ({
  model,
  children,
  className,
  size = 'default',
  ...rest
}: ButtonProps & { model?: { id: number } }) => {
  const { onShare } = useShareCard(model);

  if (!model) return null;

  return (
    <Button
      color="muted"
      variant="muted"
      size={size}
      className={cn(className, '')}
      {...rest}
      onClick={onShare}
    >
      <Share size={20} /> {children}
    </Button>
  );
};
