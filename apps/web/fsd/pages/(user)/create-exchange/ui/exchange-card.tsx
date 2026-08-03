import type { ComponentPropsWithoutRef, CSSProperties, FC, ReactNode } from 'react';

import { cn } from '@re/ui-kit/utils/cn';

import { SimpleUserCard } from '~entities/inventory/ui/simple-user-card';
import type { UserSchemaFragment } from '~shared/api/models/user';
import { Carousel, CarouselContent, CarouselItem } from '~shared/ui/carousel';

export interface ExchangeCardProps {
  user?: UserSchemaFragment | null | undefined;
  label: string;
  title: string;
  children: ReactNode;
}

export const ExchangeCard: FC<ExchangeCardProps> = ({ user, label, children, title }) => (
  <div className="flex flex-col justify-between gap-2">
    <SimpleUserCard user={user} title={title} content={label} />

    <Carousel
      opts={{
        align: 'start',
        dragFree: true,
      }}
      className="w-full"
    >
      <CarouselContent className="mx-1.5 -ml-2 md:mr-0">{children}</CarouselContent>
    </Carousel>
  </div>
);

export interface ExchangeCardItemProps extends ComponentPropsWithoutRef<typeof CarouselItem> {
  basis?: string;
}

export const ExchangeCardItem = (props: ExchangeCardItemProps) => {
  const { className, basis = '1/3', ...rest } = props;

  return (
    <CarouselItem
      style={{ ['--basis' as keyof CSSProperties]: basis }}
      className={cn('basis-[calc(var(--basis)*100%)] pl-2', className)}
      {...rest}
    />
  );
};
