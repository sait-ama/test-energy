import type { FC, MouseEvent } from 'react';
import { memo } from 'react';
import React, { useCallback, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';

import { useContentType } from '~app/providers/site-config-provider';
import { AnalyticsRepository } from '~entities/analytics/model/repository';
import type { VerticalCardProps } from '~entities/title/ui/vertical-title-card';
import { VerticalTitleCard } from '~entities/title/ui/vertical-title-card';
import type { TitleSchema } from '~shared/api/models/title';
import { Routing } from '~shared/config/routing';

type HeroSliderCard = VerticalCardProps<TitleSchema> & {
  onView: (titleId: number) => void;
  index: number;
};

export const HeroSliderViewItem: FC<HeroSliderCard> = memo(
  ({ onClick, onView, model, index, ...props }) => {
    const contentType = useContentType();
    const [ref, inView] = useInView({
      triggerOnce: true,
    });

    useEffect(() => {
      if (!inView) return;
      onView(model!.id);
    }, [inView]);

    const handleClick = useCallback(async (e: MouseEvent<HTMLAnchorElement>) => {
      if (onClick) {
        onClick(e);
      }

      await AnalyticsRepository.savePromoAction({
        data: { operation: 'click', target: model!.id },
      });
    }, []);

    return (
      <Link
        prefetch={false}
        href={Routing.Title.detail({
          params: { dir: model.dir, content: contentType, tab: 'main' },
        })}
        {...props}
      >
        <VerticalTitleCard model={model} ref={ref} onClick={handleClick} />
      </Link>
    );
  },
  (p, n) => p.model === n.model
);
