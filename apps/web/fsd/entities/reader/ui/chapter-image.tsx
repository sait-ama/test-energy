import { ComponentPropsWithoutRef, CSSProperties, useEffect, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@re/ui-kit/utils/cn';

import { useContentType } from '~app/providers/site-config-provider';
import { useCurrentChapter } from '~entities/reader/model/hooks';
import { useReaderImageLoader, useReaderImageLoaderStateImage } from '~entities/reader/model/store';
import { useCurrentPageSuspenseTitleDetail } from '~pages/(title)/title-detail/model/queries';
import { ChapterPage } from '~shared/api/models/chapter';
import { objectOptional } from '~shared/utils/object-optional';

import { ReaderWidthContainer } from './reader-width-container';

interface ChapterImageProps extends ComponentPropsWithoutRef<'div'> {
  className?: string;
  style?: CSSProperties;
  debug?: boolean; // !READERDEBUG
  model: ChapterPage;
  pageIndex: number;
}

export const ChapterImage = (props: ChapterImageProps) => {
  'use no memo';
  const { model, pageIndex, className, style = {}, debug = false, ...rest } = props;

  const { data: title } = useCurrentPageSuspenseTitleDetail();
  const { data: currentChapter } = useCurrentChapter();
  const contentType = useContentType();
  const t = useTranslations(`pages.reader.meta.${contentType}`);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const { loader, intersectionObserver } = useReaderImageLoader();

  const imageKeyStr = useMemo(() => {
    const imageKey = {
      chapter: currentChapter.chapter,
      chapterId: currentChapter.id,
      pageId: pageIndex + 1,
      imageId: model.id,
    };
    const imageKeyStr = loader.serializeKey(imageKey);
    return imageKeyStr;
  }, []);

  const image = useReaderImageLoaderStateImage(imageKeyStr);

  const inViewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!inViewRef.current) return;

    intersectionObserver?.observe(inViewRef.current);

    return () => {
      if (inViewRef.current) intersectionObserver?.unobserve(inViewRef.current);
    };
  }, [intersectionObserver]);

  useEffect(() => {
    if (!image) return;

    image.className = cn(
      'absolute inset-0 pointer-events-none align-top select-none w-full transition duration-200',
      debug
        ? [
            'outline-10 outline-violet-400', // if no state applied
            `outline-10 [&[data-status=success]]:outline-green-400`,
            `outline-10 [&[data-status=error]]:outline-red-400`,
            `outline-10 [&[data-status=pending]]:outline-blue-400`,
            `outline-10 [&[data-status=idle]]:outline-yellow-400`,
          ]
        : 'opacity-0 [&[data-status=success]]:opacity-100' // only if not debug because of outline
    );
    image.alt = t('image-alt', {
      main_name: title!.main_name,
      chapter: currentChapter.chapter,
      tome: currentChapter.tome,
      page: `${pageIndex}.${model.id}`,
    });
    image.draggable = false;
    imageContainerRef.current?.appendChild(image);

    return () => {
      image.remove();
    };
  }, [image]);

  return (
    <ReaderWidthContainer
      ref={inViewRef}
      className={cn(
        'relative m-[0_auto] h-auto max-w-(--reader-container-max-width) [filter:var(--reader-brightness)]',
        className
      )}
      style={{
        ...style,
        aspectRatio: `${model.width} / ${model.height}`,
      }}
      data-reader-vars-scope
      data-key={imageKeyStr}
      data-src={model.link}
      // server link & fallback link
      data-servlink={currentChapter.server.link}
      {...objectOptional(!!currentChapter.server.fallback_link, {
        'data-servfblink': currentChapter.server.fallback_link,
      })}
      {...rest}
    >
      <div
        className={cn(
          `bg-skeleton`,
          `[&:has(img[data-status=pending])]:light:bg-foreground/30 [&:has(img[data-status=pending])]:animate-pulse`,
          `[&:has(img[data-status=error])]:outline-danger [&:has(img[data-status=error])]:outline-1`
        )}
        ref={imageContainerRef}
        data-reader-vars-scope
        style={{
          aspectRatio: `${model.width} / ${model.height}`,
        }}
      />

      {debug ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="bg-background/90 my-auto rounded-md p-4 text-8xl">{imageKeyStr}</span>
          <span className="bg-background/90 my-auto rounded-md p-4 text-8xl">{imageKeyStr}</span>
          <span className="bg-background/90 my-auto rounded-md p-4 text-8xl">{imageKeyStr}</span>
        </div>
      ) : null}
    </ReaderWidthContainer>
  );
};
