'use client';

import { lazy, memo, ReactNode, Suspense, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useContentType } from '~app/providers/site-config-provider';
import { useSaveReadProgress } from '~entities/reader/model/hooks';
import {
  ChapterIdProvider,
  ClickableAreaHandlersProvider,
  CreateMomentProvider,
  CreateNoteProvider,
  GlobalInViewProvider,
  GlobalPagesProvider,
  HeaderVisibilityProvider,
  InfiniteReaderProvider,
  ItemsInViewProvider,
  ReaderAsideProvider,
  ReaderImageLoaderProvider,
  ReaderProvider,
  ReaderSettingsProvider,
  ScreenshoterProvider,
  useChapterId,
  useInfiniteReaderChapters,
  useReader,
  useReaderSettings,
} from '~entities/reader/model/store';
import { LoadNextChapterTrigger } from '~entities/reader/ui/load-next-trigger';
import { ReaderImageErrors } from '~entities/reader/ui/reader-image-errors';
import { ReaderWidthContainer } from '~entities/reader/ui/reader-width-container';
import { BuyChapterContainer } from '~features/buy-chapter-container/ui/buy-chapter-container';
import { ReaderLikeAppereanceAnimation } from '~features/like-appereance/ui/reader-like-appereance-animation';
import { PagerReader } from '~features/pager-manga-reader/ui/pager-reader';
import { Advertising } from '~features/reader-ad/ui/reader-ad';
import {
  ClickableArea,
  ClickableAreaToggle,
} from '~features/reader-clickable-area/ui/reader-clickable-area';
import { ReaderContainer } from '~features/reader-container/ui/reader-container';
import { ReaderPromoModalAsync } from '~features/reader-promo-modal/ui/reader-promo-modal.async';
import { ReaderScreenshoterAsync } from '~features/reader-screenshoter/ui/reader-screenshoter.async';
import { SliderReader } from '~features/slider-manga-reader/ui/slider-reader';
import { SliderReaderNovel } from '~features/slider-novel-reader/ui/slider-novel-reader';
import { useCurrentPageSuspenseTitleDetail } from '~pages/(title)/title-detail/model/queries';
import { ContentTypes } from '~shared/config/constants';
import { QuerySuspenseContainer } from '~shared/lib/react-query/query-suspense-container';
import { useSession } from '~shared/lib/session/use-session';
import { Container } from '~shared/ui/container';
import { CookieService } from '~shared/utils/cookie-service';
import { UrlFormatter } from '~shared/utils/url-formatter';
import { CommentsAsync } from '~widgets/activity/ui/comments.async';
import { CreateMomentInReaderAsync } from '~widgets/create-moment-in-reader/ui/create-moment-in-reader.async';
import { RegisterGiftButtonAsync } from '~widgets/gift/ui/register-gift-button.async';
import { AppLayoutContent, AppLayoutRoot } from '~widgets/layout/ui/app-layout';
import { ReaderErrorView } from '~widgets/reader-error-view/ui/reader-error-view';
import { Header } from '~widgets/reader-navigation/ui/reader-navigation';

import { ChapterFooter } from './chapter-footer/chapter-footer';

const ReaderAsideModal = lazy(() =>
  import(
    /* webpackChunkName: "ReaderAsideModal" */ '~widgets/reader-navigation-content/ui/reader-navigation-content'
  ).then((m) => ({
    default: m.ReaderAsideModal,
  }))
);

const SaveReadProgressBoilerplate = () => {
  useSaveReadProgress();

  return null;
};

const useRestoreInitialPageIndex = () => {
  const searchParams = useSearchParams();
  const setActivePageIndexHard = useReader((v) => v.setActivePageIndexHard);
  const page = parseInt(searchParams.get('page') ?? '1') - 1;

  useEffect(() => {
    if (setActivePageIndexHard) setActivePageIndexHard(page);
  }, []);
};

const Reader = ({ children }: { children: ReactNode }) => {
  const contentType = useContentType();

  if (contentType === ContentTypes.MANGA) {
    return <MangaReader>{children}</MangaReader>;
  }

  if (contentType === ContentTypes.NOVEL) {
    return <NovelReader>{children}</NovelReader>;
  }

  return null;
};

const NovelReader = ({ children }: { children: ReactNode }) => {
  return <SliderReaderNovel>{children}</SliderReaderNovel>;
};

const MangaReader = ({ children }: { children: ReactNode }) => {
  const readerType = useReaderSettings((v) => v.value.manga.readerType);

  // useRestoreInitialPageIndex();

  const ReaderComponent = readerType === 'slider' ? SliderReader : PagerReader;

  return <ReaderComponent>{children}</ReaderComponent>;
};

const ReaderContentLoaderProvider = ({ children }: { children: ReactNode }) => {
  const contentType = useContentType();

  if (contentType === ContentTypes.MANGA) {
    return (
      <ReaderImageLoaderProvider>
        <ReaderImageErrors />
        {children}
      </ReaderImageLoaderProvider>
    );
  }

  return children;
};

const PageFooter = memo(() => {
  const readerType = useReaderSettings((v) => v.value.manga.readerType);
  const chapterId = useChapterId();
  const activePageIndex = useReader((v) => v.activePageIndex) || 0;

  if (readerType !== 'pager') return null;

  return (
    <Container slim className="z-[1000]">
      <Advertising index={1} />
      <CommentsAsync
        className="w-full px-2"
        target={{ chapter_id: chapterId, chapter_page: activePageIndex + 1 }}
      />
    </Container>
  );
});

const ChapterAgeLimitAlert = () => {
  const { data: title } = useCurrentPageSuspenseTitleDetail();
  const session = useSession();
  const readerType = useReaderSettings((v) => v.value.manga.readerType);
  const activePageIndex = useReader((v) => v.activePageIndex);

  if (readerType === 'pager' && activePageIndex !== 0) return null;
  if (title.age_limit.id !== 2 || !session?.is_staff) return null;

  return (
    <ReaderWidthContainer className="m-[0px_auto] mt-2 mb-4 px-2">
      <div
        className={cn(
          'border-border relative flex h-[250px] w-full flex-col items-center justify-center overflow-hidden rounded-md border md:h-[168px]'
        )}
      >
        <div className="relative size-full">
          <Image
            width="276"
            height="276"
            src={UrlFormatter.media('public/app/remanga.webp')}
            alt="Logo"
            className={cn(
              'pointer-events-none absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 opacity-[0.02]'
            )}
          />
          <Image
            width="276"
            height="276"
            src={UrlFormatter.media('public/app/remanga.webp')}
            alt="Logo"
            className={cn(
              'pointer-events-none absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 opacity-[0.02]'
            )}
          />
        </div>
        <div className="absolute flex items-center gap-2 px-6">
          {/*<Image*/}
          {/*  src="/banners/age-limit-disclaimer/age-limit-disclaimer.png"*/}
          {/*  alt="Стоп курению!"*/}
          {/*  className="hidden self-end xl:block"*/}
          {/*  width={240}*/}
          {/*  height={166}*/}
          {/*/>*/}
          <div className="flex flex-col p-2">
            <ReText size="lg" weight="medium">
              В главе могут быть сцены курения!
            </ReText>
            <ReText color="muted-foreground" size="sm">
              В данном произведении присутствуют сцены курения табака! Произведение предназначено
              для лиц <span className="text-primary">старше 18 лет</span>! Мы не пропагандируем
              курение!
            </ReText>
          </div>
        </div>
      </div>
    </ReaderWidthContainer>
  );
};

const ReaderStyles = () => {
  'use no memo';
  const containerWidth = useReaderSettings((v) => v.value.common.containerWidth);
  const brightness = useReaderSettings((v) => v.value.common.brightness);
  const imageFit = useReaderSettings((v) => v.value.manga.imageFit);
  const zoom = useReaderSettings((v) => v.value.manga.zoom);

  // If you wanna use variable, just set data-reader-vars-scope

  // Motivation (vaul drawer): https://emilkowal.ski/ui/building-a-drawer-component
  // "Since CSS Variables are inheritable, changing them will cause style recalculation for all children,
  // meaning the more items I have in my drawer, the more expensive the calculation gets."

  // Since we dont want to use style to avoid rerenders, just use scope

  return (
    <style jsx global>{`
      [data-reader-vars-scope] {
        --reader-container-width: ${containerWidth}vw;
        --reader-brightness: brightness(${brightness / 100});
        --reader-container-max-width: ${imageFit === 'width' && zoom ? '100vw' : 'none'};
      }
    `}</style>
  );
};

const ReaderInstance = () => {
  return (
    <ItemsInViewProvider>
      <QuerySuspenseContainer
        fallbackRender={(props) => <ReaderErrorView {...props} />}
        fallback={null}
      >
        <BuyChapterContainer>
          <ClickableAreaHandlersProvider>
            <ReaderContainer>
              <ChapterAgeLimitAlert />
              <Reader>
                <ClickableAreaToggle area="page">
                  <ClickableArea />
                </ClickableAreaToggle>
              </Reader>
            </ReaderContainer>
            <ClickableAreaToggle area="full">
              <ClickableArea />
            </ClickableAreaToggle>
          </ClickableAreaHandlersProvider>
          <ChapterFooter />
          <PageFooter />
        </BuyChapterContainer>
      </QuerySuspenseContainer>
    </ItemsInViewProvider>
  );
};

const InfiniteReader = () => {
  const chapters = useInfiniteReaderChapters((v) => v.chapters);

  return (
    <div className="relative mb-16 flex w-full flex-col gap-8">
      {chapters.map((it) => (
        <ChapterIdProvider key={it} value={it}>
          <ReaderInstance />
        </ChapterIdProvider>
      ))}
    </div>
  );
};

type ProvidersProps = {
  children: ReactNode;
  defaultValue: string;
};

// !READERDEBUG
// dont remove, probably we will need this later
// const DebugQueue = () => {
//   const [keys, setKeys] = useState<string[]>([]);
//   useEffect(() => {

//     const handler = (e) => {
//       const values = JSON.parse(e.detail.values);
//       setKeys(values);
//     };

//     window.addEventListener('readerQueueChange', handler);

//     // Cleanup
//     return () => {
//       window.removeEventListener('readerQueueChange', handler);
//     };
//   }, []);

//   return (
//     <div className="bg-background/70 fixed top-[100px] left-[20px] flex h-[1000px] w-[400px] flex-col gap-2 rounded-md p-4">
//       {keys.map((it) => (
//         <span className="text-5xl">{it}</span>
//       ))}
//     </div>
//   );
// };

const Providers = memo(({ children, defaultValue }: ProvidersProps) => {
  const settingsContextInit = useMemo(() => {
    if (typeof window === 'undefined') return defaultValue;

    return CookieService.get('reader-settings');
  }, []);

  return (
    <ReaderSettingsProvider value={settingsContextInit}>
      <ReaderProvider>
        <ReaderAsideProvider>
          <HeaderVisibilityProvider>
            <GlobalInViewProvider>
              <ScreenshoterProvider>
                <CreateMomentProvider>
                  <CreateNoteProvider>
                    <GlobalPagesProvider>{children}</GlobalPagesProvider>
                    <CreateMomentInReaderAsync />
                  </CreateNoteProvider>
                </CreateMomentProvider>
                <RegisterGiftButtonAsync />
                <ReaderScreenshoterAsync />
              </ScreenshoterProvider>
            </GlobalInViewProvider>
          </HeaderVisibilityProvider>
          <SaveReadProgressBoilerplate />
        </ReaderAsideProvider>
      </ReaderProvider>
    </ReaderSettingsProvider>
  );
});

export const ReaderRoot = ({ defaultValue }: Omit<ProvidersProps, 'children'>) => {
  return (
    <Suspense>
      <Providers defaultValue={defaultValue}>
        <AppLayoutRoot>
          {/* !READERDEBUG */}
          {/* <DebugQueue /> */}
          <ReaderStyles />
          <Header />
          <AppLayoutContent>
            <InfiniteReaderProvider>
              <ReaderContentLoaderProvider>
                <InfiniteReader />
                <LoadNextChapterTrigger />
              </ReaderContentLoaderProvider>
            </InfiniteReaderProvider>

            <ReaderLikeAppereanceAnimation />

            <Suspense fallback={null}>
              <ReaderAsideModal />
            </Suspense>

            <ReaderPromoModalAsync />

            {/*<CardContent />*/}
            <script
              dangerouslySetInnerHTML={{
                __html: `history.scrollRestoration = "manual"`,
              }}
            />
          </AppLayoutContent>
        </AppLayoutRoot>
      </Providers>
    </Suspense>
  );
};
