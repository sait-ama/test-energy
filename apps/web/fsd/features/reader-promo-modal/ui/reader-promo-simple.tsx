import Link from 'next/link';

import { useQuery } from '@tanstack/react-query';

import { v2ActivityActiveGiftRetrieveOptions } from '@re/api/generated/@tanstack/react-query.gen';
import { Button } from '@re/ui-kit/ui/button';
import { MediaOptimizedImage, MediaRoot } from '@re/ui-kit/ui/media';

import { client } from '~shared/api/client';
import { UrlFormatter } from '~shared/utils/url-formatter';

export const ReaderPromoSimple = ({
  placement,
  onSubmit,
}: {
  placement: 'chapter_read' | 'getting_card';
  onSubmit: () => void;
}) => {
  const { data, isLoading } = useQuery(
    v2ActivityActiveGiftRetrieveOptions({ client, query: { placement_type: placement } })
  );

  if (isLoading) return null;

  return (
    <div className="bg-secondary relative overflow-hidden rounded-xl p-4 pt-0 pb-6">
      <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-blue-500/5 blur-xl dark:bg-blue-400/10" />
      <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-purple-500/5 blur-xl dark:bg-purple-400/10" />

      <div className="relative flex flex-col items-center justify-center">
        <MediaRoot className="relative transform transition-transform duration-200 hover:scale-[1.02]">
          <MediaOptimizedImage
            src={UrlFormatter.media(data!.image.high)}
            alt="Gift"
            width={90}
            height={100}
            className="rotate-30 drop-shadow-lg"
          />
        </MediaRoot>

        <div className="mb-4">
          <div className="text-foreground text-md text-center font-bold">Поздравляем!</div>
          <p
            className="text-muted-foreground text-md leading-1.1 mt-1 text-center"
            dangerouslySetInnerHTML={{ __html: data!.text }}
          />
        </div>

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
        <Button
          asChild
          size="lg"
          variant="default"
          onClick={onSubmit}
          className="mx-auto h-10 text-[16px] font-semibold shadow-md transition-all duration-200 hover:shadow-lg"
        >
          <Link target="_blank" href={data!.link}>
            ✨ Выбрать ✨
          </Link>
        </Button>
      </div>
    </div>
  );
};
