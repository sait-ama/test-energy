'use client';

import { useTranslations } from 'next-intl';

import Close from '@re/ui-kit/icons/close';
import ExternalLink from '@re/ui-kit/icons/external-link';
import { Button } from '@re/ui-kit/ui/button';
import { Dialog, DialogContent } from '@re/ui-kit/ui/dialog';
import { ReText } from '@re/ui-kit/ui/text';

import { usePromotionDetailDialog } from '~entities/promotion/model/store';
import { UrlFormatter } from '~shared/utils/url-formatter';

export const PromotionDetailDialog = () => {
  const isOpen = usePromotionDetailDialog((state) => state.isOpen);
  const promotion = usePromotionDetailDialog((state) => state.promotion);
  const closeDialog = usePromotionDetailDialog((state) => state.closeDialog);

  const t = useTranslations();

  if (!promotion) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent
        className="overflow-hidden border-none bg-[#18181B] p-0 shadow-2xl sm:max-w-sm"
        withClose={false}
      >
        <Button
          onClick={closeDialog}
          color="secondary"
          circle
          className="absolute top-3 right-3 z-20 rounded-full bg-black/40 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
        >
          <Close className="size-4" />
        </Button>

        <div className="flex flex-col">
          <div className="relative w-full overflow-hidden">
            <img
              src={UrlFormatter.media(promotion.cover)}
              alt={promotion.header}
              loading="lazy"
              className="max-h-[320px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-[#18181B]"></div>
          </div>

          <div className="z-10 -mt-20 mb-2 w-full px-6 py-5">
            <h1 className="mb-5 text-3xl leading-tight font-bold text-white">{promotion.header}</h1>

            <div className="mb-6 py-2">
              <ReText className="text-base leading-relaxed text-gray-300">
                {promotion.description}
              </ReText>
            </div>

            <a
              href={promotion.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full"
            >
              <Button className="w-full" endIcon={<ExternalLink className="ml-1 size-4" />}>
                {t('pages.home.promotion-slider.dialog.linkText')}
              </Button>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Named export for direct imports
export default PromotionDetailDialog;
