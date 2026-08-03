import { memo } from 'react';
import Link from 'next/link';

import { useQuery } from '@tanstack/react-query';

import { v2ActivityActiveGiftRetrieveOptions } from '@re/api/generated/@tanstack/react-query.gen';
import { Button } from '@re/ui-kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@re/ui-kit/ui/dialog';
import { MediaOptimizedImage, MediaRoot } from '@re/ui-kit/ui/media';

import { client } from '~shared/api/client';
import { UrlFormatter } from '~shared/utils/url-formatter';

import { useReaderPromoModalAcc } from '../model/hooks';
import { useReaderPromoModalStore } from '../model/store';

const ReaderPromoModalImpl = memo(() => {
  useReaderPromoModalAcc();

  const isOpen = useReaderPromoModalStore((v) => v.isOpen);
  const onSubmit = useReaderPromoModalStore((v) => v.onSubmit);
  const onClose = useReaderPromoModalStore((v) => v.onClose);
  const { data } = useQuery(v2ActivityActiveGiftRetrieveOptions({ client }));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-background relative flex max-w-[360px]! flex-col items-center justify-center border p-6 shadow-lg">
        <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-blue-500/5 blur-xl dark:bg-blue-400/10" />
        <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-purple-500/5 blur-xl dark:bg-purple-400/10" />

        <DialogHeader className="mb-6">
          <DialogTitle className="text-foreground text-center text-xl font-bold">
            🎉 Поздравляем!
          </DialogTitle>
          <p
            className="text-muted-foreground mt-3 text-center text-sm"
            dangerouslySetInnerHTML={{ __html: data!.text }}
          />
        </DialogHeader>

        <div className="relative mb-6">
          <div className="absolute inset-0 -m-4 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-lg dark:from-blue-400/15 dark:via-purple-400/15 dark:to-pink-400/15" />

          <MediaRoot className="relative transform transition-transform duration-200 hover:scale-[1.02]">
            <MediaOptimizedImage
              src={UrlFormatter.media(data!.image.high)}
              alt="Gift"
              width={180}
              height={200}
              className="drop-shadow-lg"
            />
          </MediaRoot>

          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute top-4 left-6 h-1 w-1 animate-ping rounded-full bg-yellow-400/60"
              style={{ animationDelay: '0s' }}
            />
            <div
              className="absolute top-8 right-8 h-0.5 w-0.5 animate-ping rounded-full bg-pink-400/60"
              style={{ animationDelay: '1s' }}
            />
            <div
              className="absolute bottom-8 left-8 h-1 w-1 animate-ping rounded-full bg-blue-400/60"
              style={{ animationDelay: '2s' }}
            />
            <div
              className="absolute right-6 bottom-4 h-0.5 w-0.5 animate-ping rounded-full bg-purple-400/60"
              style={{ animationDelay: '3s' }}
            />
          </div>
        </div>

        <DialogFooter className="w-full">
          <Button
            asChild
            variant="default"
            size="lg"
            onClick={onSubmit}
            className="h-11 w-full text-[16px] font-semibold shadow-md transition-all duration-200 hover:shadow-lg"
          >
            <Link target="_blank" href={data!.link}>
              ✨ Выбрать ✨
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export const ReaderPromoModal = () => {
  const { isLoading, data } = useQuery(v2ActivityActiveGiftRetrieveOptions({ client }));

  if (isLoading) return null;
  if (!data) return null;

  return <ReaderPromoModalImpl />;
};
