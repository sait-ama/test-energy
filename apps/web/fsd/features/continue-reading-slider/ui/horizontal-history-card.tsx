import type { CSSProperties, ForwardedRef, ReactNode } from 'react';
import { forwardRef } from 'react';
import Link from 'next/link';

import { useTranslations } from 'use-intl';

import { Progress } from '@re/ui-kit/ui/progress';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useContentType } from '~app/providers/site-config-provider';
import { TITLE_PREVIEW_SIZE } from '~entities/title/model/consts';
import { TitleImage } from '~entities/title/ui/title-image';
import type { TitleUserHistory } from '~shared/api/models/user';
import type { RoutingLinkProps } from '~shared/config/routing';
import { Routing } from '~shared/config/routing';

interface HorizontalTitleUserHistoryCardProps extends Omit<RoutingLinkProps, 'children'> {
  model: TitleUserHistory;
  tag?: ReactNode;
  isLoading?: boolean;
  className?: string;
  rating?: ReactNode;
  style?: CSSProperties;
  actions?: ReactNode;
  heading?: ReactNode;

  [key: `data-${string}`]: NumberIsomorphic | boolean;
}

export const HorizontalHistoryCard = forwardRef(
  (props: HorizontalTitleUserHistoryCardProps, ref: ForwardedRef<HTMLAnchorElement>) => {
    const {
      model,
      actions,
      heading = (
        <ReText weight="semibold" size="sm" lineClamp={2}>
          {model.title.main_name}
        </ReText>
      ),
      ...rest
    } = props;

    const { index, chapter } = model.chapter ?? {};
    const { main_name, cover, dir, count_chapters } = model.title ?? {};

    const contentType = useContentType();

    const t = useTranslations();

    return (
      <Link
        prefetch={false}
        ref={ref}
        href={Routing.Title.detail({
          params: {
            dir,
            tab: Routing.Title.TitleDetailTabs.MAIN,
            content: contentType,
          },
        })}
        className={cn(
          'bg-card inline-flex w-full items-stretch gap-4 overflow-hidden rounded-md p-2 pr-3 select-none'
        )}
        {...rest}
      >
        {actions}
        <TitleImage
          className="aspect-2/3 w-12 select-none md:w-16"
          alt={`Обложка произведения ${main_name}`}
          isLoading={false}
          src={cover[TITLE_PREVIEW_SIZE]}
          fill
          priority
        />
        <div className="flex flex-1 flex-col justify-center gap-3 select-none">
          {heading}

          {index ? (
            <div className="flex flex-col gap-2">
              <ReText size="xs" component="span" lineClamp={1} color="muted-foreground">
                {t('pages.home.continue-reading.item.reading-status', {
                  index,
                  total: count_chapters,
                })}
              </ReText>
              <Progress value={(100 * index) / count_chapters} className="h-1" />
            </div>
          ) : null}
        </div>
      </Link>
    );
  }
);
