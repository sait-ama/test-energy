import type { FC } from 'react';
import { memo } from 'react';
import React from 'react';
import Link from 'next/link';

import { useContentType } from '~app/providers/site-config-provider';
import type { VerticalCardProps } from '~entities/title/ui/vertical-title-card';
import { VerticalTitleCard } from '~entities/title/ui/vertical-title-card';
import type { TitleSchema } from '~shared/api/models/title';
import { Routing } from '~shared/config/routing';

type CommonSliderProps = VerticalCardProps<TitleSchema> & {
  novel?: boolean;
};

export const SliderItem: FC<CommonSliderProps> = memo(
  ({ novel, model, ...props }) => {
    const contentType = useContentType();

    return (
      <Link
        prefetch={false}
        href={Routing.Title.detail({
          params: { dir: model?.dir, content: contentType, tab: 'main' },
        })}
        {...props}
      >
        <VerticalTitleCard model={model} />
      </Link>
    );
  },
  (p, n) => p.model === n.model
);
