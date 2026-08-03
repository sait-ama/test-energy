import type { CSSProperties, MouseEvent } from 'react';
import React from 'react';

import { SkeletonSlot } from '@re/ui-kit/ui/skeleton';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useContentType } from '~app/providers/site-config-provider';
import { AuthorButton } from '~entities/inventory/ui/author-button';
import { HeroCardImage } from '~entities/inventory/ui/hero-card-image';
import type { HeroCardSchema } from '~shared/api/models/inventory';
import { Routing } from '~shared/config/routing';
import { LinkBase } from '~shared/ui/link-base';
import TitleDetailTabs = Routing.Title.TitleDetailTabs;
import Link from 'next/link';

interface HeroCardHorizontalCardProps<T extends HeroCardSchema> {
  isLoading?: boolean;
  model: T;
  className?: string;
  style?: CSSProperties;
  onClick: (event: MouseEvent<HTMLDivElement>) => void;

  [key: `data-${string}`]: number | string;
}

export const HeroCardHorizontalCard = <T extends HeroCardSchema>(
  props: HeroCardHorizontalCardProps<T>
) => {
  const { className, model, isLoading, ...rest } = props;
  const { title, description, author, character, cover } = model;

  const contentType = useContentType();

  return (
    <div
      className={cn(
        'group bg-bacground-content relative flex w-full flex-col items-center gap-4 overflow-hidden rounded-md p-4 md:flex-row md:gap-3',
        !isLoading && 'hover-card',
        className
      )}
      {...rest}
    >
      <HeroCardImage src={cover?.mid} alt="alt" className="w-3/5 md:w-2/5" />
      <div className="flex flex-col gap-2.5">
        {title ? (
          <LinkBase color="secondary">
            <Link
              href={Routing.Title.detail({
                params: {
                  dir: title.dir,
                  content: contentType,
                  tab: TitleDetailTabs.MAIN,
                },
              })}
              target="_blank"
            >
              <ReText weight="medium" className="mb-3 text-center md:text-left">
                {title.main_name}
              </ReText>
            </Link>
          </LinkBase>
        ) : null}
        <ReText size="md" weight="medium" lineClamp={2} className="text-center md:text-left">
          <SkeletonSlot
            show={isLoading}
            count={0.5}
            render={character?.name || 'Коллекционная карточка'}
          />
        </ReText>
        <ReText
          size="xs"
          indent="xxs"
          color="muted-foreground"
          className="mb-3 text-center md:text-left"
          dangerouslySetInnerHTML={{ __html: description ?? '' }}
        />
        <AuthorButton author={author} />
      </div>
    </div>
  );
};
