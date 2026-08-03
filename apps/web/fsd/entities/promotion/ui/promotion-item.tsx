import React from 'react';
import { useTranslations } from 'next-intl';

import ChevronRightIcon from '@re/ui-kit/icons/chevron-right';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import { usePromotionDetailDialog } from '~entities/promotion/model/store';
import type { Promotion } from '~shared/api/models/promotion';
import { UrlFormatter } from '~shared/utils/url-formatter';

interface IPromotionItem {
  data: Promotion;
}

export const PromotionItem = (props: IPromotionItem) => {
  const { data } = props;
  const openDialog = usePromotionDetailDialog((state) => state.openDialog);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openDialog(data);
  };

  const t = useTranslations();

  return (
    <div onClick={handleClick} className="group p block h-full cursor-pointer">
      <div className="bg-secondary hover:border-primary/20 dark:hover:border-primary/30 relative size-full overflow-hidden rounded-md border border-transparent transition-all duration-300">
        <div className="absolute right-0 bottom-0 aspect-square h-full overflow-hidden">
          <img
            src={UrlFormatter.media(data.cover)}
            alt={data.header}
            loading="lazy"
            className="h-full w-full transform object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="dark:to-secondary/90 absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-white/90"></div>
        </div>

        <div className="relative z-10 flex h-full flex-col justify-center p-4 pr-32 md:py-6 md:pl-6 lg:pr-40">
          <div className="flex w-full flex-col gap-2">
            <ReText
              size="md"
              weight="semibold"
              lineClamp={2}
              // className="group-hover:text-primary transition-colors duration-300"
            >
              {data.header}
            </ReText>
            <div className="mt-1">
              <Button variant="link" size="xs" className="px-0">
                {t('pages.home.promotion-slider.item.detailsButtonText')}
                <ChevronRightIcon className="ml-1 h-3 w-3 transform transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
