'use client';

import type { Dispatch, ReactNode, RefObject, SetStateAction } from 'react';
import {
  createContext as createReactContext,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { useParams, usePathname, useSearchParams } from 'next/navigation';

import { useRouter } from '@bprogress/next';
import { createContext } from '@re/core/utils/create-context';
import { createContextSelector } from '@re/core/utils/create-context-selector';
import deepmerge from 'deepmerge';

import { HotkeyAction, IMAGE_SERVER, ImageServer } from '~entities/reader/model/const';
import {
  getChapterImagePath,
  useActiveChapter,
  useCurrentChapter,
} from '~entities/reader/model/hooks';
import type { ReaderSettingsSchema } from '~entities/reader/model/validators';
import { useBoolean } from '~shared/hooks/use-boolean';
import { useMapOfSets } from '~shared/hooks/use-map-of-sets';
import { useScreenSuspense } from '~shared/hooks/use-media-query';
import { useOpen } from '~shared/hooks/use-open';
import { useScrollTrigger } from '~shared/hooks/use-scroll-trigger';
import { Actions, useSet } from '~shared/hooks/use-set';
import { logger } from '~shared/lib/logger';
import { breakpoints, Display } from '~shared/lib/media/const';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { CookieService } from '~shared/utils/cookie-service';
import { publicEnv } from '~shared/utils/env';
import { parseJson } from '~shared/utils/parse-json';
import { UrlFormatter } from '~shared/utils/url-formatter';
import { useStrictContext } from '~shared/utils/use-strict-context';

import {
  ImageOptimizedLoader,
  ImageOptimizedLoaderQueueName,
  ImageOptimizedLoaderStateItem,
  ImageOptimizedLoaderStateStatus,
  ImageOptimizedLoaderSubscriberFunction,
} from './helpers/image-optimized-loader';
import { ReaderImageLoaderKey } from './types';

const defaultReaderSettings: ReaderSettingsSchema = {
  novel: {
    fontSize: 19,
    lineHeight: 1.7,
  },
  manga: {
    imageServer: parseInt(publicEnv('DEFAULT_IMAGE_SERVER'), 10) || 1,
    readerType: 'slider',
    clickableAreaId: 1,
    imageFit: 'width',
    zoom: false,
    clickableAreaZone: 'page',
    gapBetweenItems: 0,
    notes: false,
    pageIndicator: true,
  },
  common: {
    hidePageIndex: false,
    brightness: 100,
    autoLoad: true,
    tapToScroll: false,
    tapToScrollSize: 50,
    autoScrollSize: 1,
    containerWidth: 100,
    backActionStrategyId: 1,
    hotkeys: {
      [HotkeyAction.NEXT_CHAPTER]: ['E/KeyE', 'ArrowRight/Ctrl+ArrowRight'],
      [HotkeyAction.PREV_CHAPTER]: ['Q/KeyQ', 'ArrowLeft/Ctrl+ArrowLeft'],
      [HotkeyAction.NEXT_PAGE]: ['D/KeyD', 'ArrowRight/ArrowRight'],
      [HotkeyAction.PREV_PAGE]: ['A/KeyA', 'ArrowLeft/ArrowLeft'],
      [HotkeyAction.SCROLL_TOP]: [],
      [HotkeyAction.SCROLL_BOTTOM]: [],
      [HotkeyAction.INCREASE_CONTAINER_WIDTH]: ['+/Equal', '=/Equal'],
      [HotkeyAction.DECREASE_CONTAINER_WIDTH]: ['-/Minus', '_/Minus'],
    },
  },
};

export const { Provider: ReaderAsideProvider, useStore: useReaderAside } = createContextSelector(
  () => {
    const [value, onValueChange] = useState<string | undefined>();

    return { value, onValueChange };
  },
  'ReaderAsideStore'
);

export const {
  Provider: ReaderSettingsProvider,
  useStore: useReaderSettings,
  Consumer: ReaderSettingsConsumer,
} = createContext<
  {
    value: ReaderSettingsSchema;
    onValueChange: Dispatch<SetStateAction<Partial<ReaderSettingsSchema>>>;
  },
  string | null
>((defaultValue) => {
  const [value, setValue] = useState<ReaderSettingsSchema>(() =>
    deepmerge(defaultReaderSettings, parseJson<ReaderSettingsSchema>(defaultValue ?? '') || {}, {
      arrayMerge: (target, source) => source ?? target,
    })
  );

  const onValueChange = useCallback((value: SetStateAction<Partial<ReaderSettingsSchema>>) => {
    setValue((prev) => {
      const mergedSettings = {
        ...prev,
        ...(typeof value === 'function' ? value(prev) : value),
      };
      CookieService.set('reader-settings', mergedSettings);

      return mergedSettings;
    });
  }, []);

  return { value, onValueChange };
});

export const { Provider: ReaderProvider, useStore: useReader } = createContext(() => {
  const searchParams = useSearchParams();
  const params = useParams<{ chapter: string; dir: string }>();
  const [setActivePageIndexHard, setActivePageIndexHardFunc] = useState<
    ((index: number) => void) | null
  >(null);
  const [autoScrollFunc, setAutoScrollFunc] = useState<((enabled: boolean) => void) | null>(null);
  const activeChapterRef = useRef<HTMLDivElement | null>(null);
  const [activeChapterId, setActiveChapterId] = useState<number>(parseInt(params.chapter, 10));
  const initialPageIndex = useMemo(() => parseInt(searchParams.get('page') ?? '1', 10) - 1, []);
  const [activePageIndex, setActivePageIndex] = useState(initialPageIndex);

  const pathname = usePathname();
  const router = useRouter();

  const handleActiveChapterId = (value: number) =>
    setActiveChapterId((prevValue) => {
      if (prevValue === value) return prevValue;

      const newPathname = pathname.split('/').slice(0, -1).concat(String(value)).join('/');
      window.history.pushState({}, '', newPathname);

      return value;
    });

  const handleActivePageIndex = (value: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(value + 1));
    setActivePageIndex(value);

    window.history.replaceState({}, '', `${pathname}?${params.toString()}`);
  };

  const handleActiveChapterIdHard = (value: number) => {
    const newPathname = pathname.split('/').slice(0, -1).concat(String(value)).join('/');
    setActiveChapterId(value);

    router.push(newPathname);
  };

  return {
    autoScrollFunc,
    setAutoScrollFunc,
    activeChapterId,
    activeChapterRef,
    initialPageIndex,
    activePageIndex,
    setActivePageIndexHard,
    setActivePageIndexHardFunc,
    setActiveChapterId: handleActiveChapterId,
    setActivePageIndex: handleActivePageIndex,
    setActiveChapterIdHard: handleActiveChapterIdHard,
  };
}, 'ReaderStore');

export const { useStore: useInfiniteReaderChapters, Provider: InfiniteReaderProvider } =
  createContextSelector(() => {
    const activeChapterId = useReader((v) => v.activeChapterId);
    const [chapters, setChapters] = useState<number[]>([activeChapterId]);
    const readerType = useReaderSettings((v) => v.value.manga.readerType);
    const setSettings = useReaderSettings((v) => v.onValueChange);

    useEffect(() => {
      if (readerType === 'pager') {
        setChapters([activeChapterId]);
        setSettings((prev) => ({ ...prev, common: { ...prev.common, autoLoad: false } }));
      }
    }, [readerType]);

    return {
      chapters,
      __dangerously_setChapters: setChapters,
    };
  }, 'InfiniteReaderStore');

export const { useStore: useChapterId, Provider: ChapterIdProvider } = createContextSelector<
  number,
  number
>((v) => v);

export const { useStore: useItemsInView, Provider: ItemsInViewProvider } = createContextSelector(
  () => {
    const [set, utils] = useSet<number>();
    const chapterId = useChapterId();
    const { addToSet, removeFromSet } = useGlobalInView((v) => v.actions);

    const patchedUtils = {
      ...utils,
      remove: (key: number) => {
        utils.remove(key);
        removeFromSet(chapterId, key);
      },

      add: (key: number) => {
        utils.add(key);
        addToSet(chapterId, key);
      },
    };

    return { set, utils: patchedUtils };
  },
  'ItemsInViewStore'
);

export const { Provider: HeaderVisibilityProvider, useStore: useHeaderVisibility } =
  createContextSelector(() => {
    const [visible, toggle, setValue] = useBoolean(true);

    const isDesktop = useScreenSuspense(`(min-width: ${breakpoints[Display.md]}px)`);

    const trigger = useScrollTrigger();

    const close = () => {
      setValue(false);
    };

    useEffect(() => {
      if (isDesktop) {
        setValue(!trigger);
      }
    }, [trigger, isDesktop]);

    return {
      visible,
      toggle,
      close,
    };
  }, 'HeaderVisibilityStore');

export const getTransitionStyle = (visible: boolean, inverted = false) => {
  return {
    transition: 'transform 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    transform: `translate3d(0, ${visible ? '0%' : inverted ? '200%' : '-200%'}, 0)`,
    willChange: 'transform',
  };
};

export const { Provider: ClickableAreaHandlersProvider, useStore: useClickableAreaHandlers } =
  createContextSelector(() => {
    const [actions, setActions] = useState<Record<'onMenu' | 'onNext' | 'onPrev', VoidFunction>>({
      onPrev: () => null,
      onMenu: () => null,
      onNext: () => null,
    });

    const [previewMode, togglePreviewMode] = useOpen(false);

    const registerActions = (
      actions: Partial<Record<'onMenu' | 'onNext' | 'onPrev', VoidFunction>>
    ) => {
      setActions((prev) => ({ ...prev, ...actions }));
    };

    return {
      actions,
      registerActions,
      previewMode,
      togglePreviewMode,
    };
  }, 'ClickableAreaStore');

interface Screenshoter {
  callbacks: {
    onSuccess: ((value: string) => void) | undefined;
    onDeny: VoidFunction | undefined;
  };
  state: {
    isOpened: boolean;
    isLoading: boolean;
    style?: ReactNode;
    aspect?: number | null;
    mergedImageUrl: string | null;
    editedImageUrl: string | null;
  };
}

export const { Provider: ScreenshoterProvider, useStore: useScreenshoter } = createContextSelector(
  () => {
    const [screenshoter, setScreenshoter] = useState<Screenshoter>({
      callbacks: {
        onSuccess: undefined,
        onDeny: undefined,
      },
      state: {
        isOpened: false,
        isLoading: false,
        mergedImageUrl: null,
        editedImageUrl: null,
      },
    });

    const { data } = useActiveChapter();
    const map = useGlobalInView((v) => v.map);

    const onReset = () => {
      setScreenshoter((prev) => ({
        state: {
          ...prev.state,
          isOpened: false,
          mergedImageUrl: null,
          editedImageUrl: null,
          style: null,
        },
        callbacks: {
          ...prev.callbacks,
          onSuccess: undefined,
        },
      }));
    };

    const onScreenshot = async ({ onSuccess }: { onSuccess: (value: string) => void }) => {
      const activePagesIndexes = Array.from(map.get(data!.id) ?? []);
      const toast = await importToastAsync();

      if (!activePagesIndexes.length) {
        toast.error('Нет страниц в области видимости');
        return;
        // throw new Error('Нет страниц в области чтения');
      }

      const links = activePagesIndexes
        .map((idx) => data?.pages?.[idx]?.map((it) => it.link))
        .flat()
        .filter((v) => v) as string[];

      if (!links.length) {
        toast.error('Нет ссылок на страницы');
        return;
        // throw new Error('Нет ссылок на страницы');
      }

      try {
        setScreenshoter((prev) => ({ ...prev, state: { ...prev.state, isLoading: true } }));
        const blob = await fetch('/bff-api/merge-images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageUrls: links }),
        }).then((response) => response.blob());
        const url = URL.createObjectURL(blob);

        setScreenshoter((prev) => ({
          ...prev,
          state: {
            ...prev.state,
            isOpened: true,
            mergedImageUrl: url,
            isLoading: false,
            aspect: null,
          },
          callbacks: {
            onSuccess: onSuccess,
            onDeny: onReset,
          },
        }));
      } catch (e: unknown) {
        logger.error(e);
        toast.error('Ошибка объединения изображений. Попробуйте позже или листните вверх/вниз');
      }

      setScreenshoter((prev) => ({ ...prev, state: { ...prev.state, isLoading: false } }));
    };

    const onStateChange = (state: Partial<Screenshoter['state']>) => {
      if (state?.editedImageUrl && screenshoter.state.editedImageUrl !== state.editedImageUrl) {
        screenshoter.callbacks.onSuccess?.(state.editedImageUrl);
        onReset();
        return;
      }

      setScreenshoter({ ...screenshoter, state: { ...screenshoter.state, ...state } });
    };

    return {
      screenshoter,
      onScreenshot,
      onStateChange,
    };
  },
  'ScreenshoterStore'
);

export const { Provider: GlobalInViewProvider, useStore: useGlobalInView } = createContextSelector(
  () => {
    const [map, actions] = useMapOfSets<number, number>();

    return { map, actions };
  },
  'GlobalInViewStore'
);

export const { Provider: GlobalPagesProvider, useStore: useGlobalPages } = createContextSelector(
  () => {
    return useRef<Record<number, Record<number, HTMLDivElement | null>>>({});
  },
  'GlobalPagesStore'
);

export const { Provider: CreateMomentProvider, useStore: useMomentCreator } = createContextSelector(
  () => {
    const [url, setUrl] = useState<string>('');

    return {
      url,
      setUrl,
    };
  },
  'CreateMomentProvider'
);

export const { Provider: CreateNoteProvider, useStore: useNoteStore } = createContextSelector(
  () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    return {
      isOpen,
      setIsOpen,
    };
  },
  'CreateNoteStore'
);

class ReaderImageOptimizedLoader extends ImageOptimizedLoader<ReaderImageLoaderKey, ImageServer> {
  public serializeKey(key: ReaderImageLoaderKey): string {
    return JSON.stringify([key.chapterId, key.chapter, key.pageId, key.imageId]);
  }

  public deserializeKey(keyStr: string): ReaderImageLoaderKey {
    const [chapterId, chapter, pageId, imageId] = JSON.parse(keyStr) as [
      ReaderImageLoaderKey['chapterId'],
      ReaderImageLoaderKey['chapter'],
      ReaderImageLoaderKey['pageId'],
      ReaderImageLoaderKey['imageId'],
    ];

    return { chapterId, imageId, chapter, pageId };
  }
}

const ReaderImageLoaderInstanceContext = createReactContext<ReaderImageOptimizedLoader | null>(
  null
);

export const ReaderImageLoaderInstanceContextProvider = memo((props: { children: ReactNode }) => {
  const loader = useMemo(
    () => new ReaderImageOptimizedLoader({ origins: [IMAGE_SERVER.RESERVED, IMAGE_SERVER.MAIN] }),
    []
  );

  return (
    <ReaderImageLoaderInstanceContext.Provider value={loader}>
      {props.children}
    </ReaderImageLoaderInstanceContext.Provider>
  );
});

const useReaderImageLoaderInstance = () => useStrictContext(ReaderImageLoaderInstanceContext);

// todo: move to selectors when stores will not update on each member change
const ReaderImageLoaderErrorsStateContext = createReactContext<Set<string> | null>(null);

export const useReaderImageLoaderErrorsInViewState = () =>
  useStrictContext(ReaderImageLoaderErrorsStateContext);

const ReaderImageLoaderErrorsActionsContext = createReactContext<Actions<string> | null>(null);

export const useReaderImageLoaderErrorsInViewActions = () =>
  useStrictContext(ReaderImageLoaderErrorsActionsContext);

const ReaderImageLoaderErrorsProvider = memo((props: { children: ReactNode }) => {
  const [errorSet, errorSetUtils] = useSet<string>();

  return (
    <ReaderImageLoaderErrorsStateContext.Provider value={errorSet}>
      <ReaderImageLoaderErrorsActionsContext.Provider value={errorSetUtils}>
        {props.children}
      </ReaderImageLoaderErrorsActionsContext.Provider>
    </ReaderImageLoaderErrorsStateContext.Provider>
  );
});

type ImageInViewSchema = {
  key: ReaderImageLoaderKey;
  keyStr: string;
  images: Record<ImageServer, { src: string }>;
};

// not intended to store any state
// pass state deps from ouside (ReaderImageLoaderProvider)
// dont forget to add state deps to memo propsAreEqual (ReaderImageLoaderInnerProviderMemoized)
const { Provider: ReaderImageLoaderInnerProvider, useStore: useReaderImageLoader } = createContext<
  {
    loader: ReaderImageOptimizedLoader;
    imagesInViewRef: RefObject<Map<string, ImageInViewSchema>>;
    intersectionObserver: IntersectionObserver | null;
  },
  { imageServer: number; globalChapterIds: number[] }
>(({ imageServer, globalChapterIds }) => {
  const errorActions = useReaderImageLoaderErrorsInViewActions();

  const loader = useReaderImageLoaderInstance();

  useEffect(() => {
    const origins =
      imageServer === IMAGE_SERVER.MAIN
        ? [IMAGE_SERVER.MAIN, IMAGE_SERVER.RESERVED]
        : [IMAGE_SERVER.RESERVED, IMAGE_SERVER.MAIN];

    loader.updateOrigins(origins);
  }, [imageServer]);

  useEffect(() => {
    if (loader.getState().size < 150) return;

    const globalChapterIdsSet = new Set(globalChapterIds);

    loader.cleanup({ predicate: (key) => !globalChapterIdsSet.has(key.chapterId) });
  }, [globalChapterIds]);

  const imagesInViewRef = useRef<
    Map<
      string, // keyStr
      ImageInViewSchema
    >
  >(new Map()); // dont need state here;

  const handleUpdateErrorsInView = useCallback((imageKeyStr: string, isIntersecting: boolean) => {
    const imageItem = loader.getStateByKey(imageKeyStr);

    if (imageItem?.status === ImageOptimizedLoaderStateStatus.ERROR && isIntersecting) {
      errorActions.add(imageKeyStr);
    }

    if (imageItem?.status !== ImageOptimizedLoaderStateStatus.ERROR || !isIntersecting) {
      errorActions.remove(imageKeyStr);
    }
  }, []);

  const handleAbort = useCallback(() => {
    const images = [...imagesInViewRef.current.values()];

    if (!images.length) return;

    const earliestInViewImage = images.reduce(
      (acc, it) => {
        const weight = Number(it.key.chapter) * 100 + it.key.pageId;

        return weight < acc.weight
          ? {
              chapter: it.key.chapter,
              pageId: it.key.pageId,
              weight,
            }
          : acc;
      },
      {
        chapter: '99999',
        pageId: 99,
        weight: 99999_99,
      }
    );

    loader.abort({
      predicate: (key) => {
        const image = imagesInViewRef.current.get(loader.serializeKey(key));

        if (image) return false; // not abort if in view
        if (Number(key.chapter) < Number(earliestInViewImage.chapter)) return true; // not abort the current chapter and later
        return (
          key.chapter === earliestInViewImage.chapter && key.pageId < earliestInViewImage.pageId - 1
        );
      },
      queue: ImageOptimizedLoaderQueueName.BACKGROUND,
    });
  }, []);

  const handleLoad = useCallback((item: ImageInViewSchema) => {
    loader.load({
      key: item.key,
      images: item.images,
      queue: ImageOptimizedLoaderQueueName.PRIME,
    });
  }, []);

  const [intersectionObserver, setIntersectionObserver] = useState<IntersectionObserver | null>(
    null
  );

  useEffect(() => {
    const handleIntersect = (entry: IntersectionObserverEntry) => {
      const entryTarget = entry.target as HTMLDivElement;
      const imageKeyStr = entryTarget.dataset.key;
      const imageSrc = entryTarget.dataset.src;
      const serverLink = entryTarget.dataset.servlink;
      const serverFallbackLink = entryTarget.dataset.servfblink;

      if (!imageKeyStr || !imageSrc || !serverLink) {
        logger.warn('Missing data attributes on observed element');
        return;
      }

      const imagePath = getChapterImagePath(imageSrc);

      const imageInViewItem: ImageInViewSchema = {
        keyStr: imageKeyStr,
        key: loader.deserializeKey(imageKeyStr),
        images: {
          [IMAGE_SERVER.MAIN]: {
            src: UrlFormatter.createUrl(serverLink, imagePath),
          },
          [IMAGE_SERVER.RESERVED]: {
            src: UrlFormatter.createUrl(serverFallbackLink, imagePath),
          },
        },
      };

      if (entry.isIntersecting) {
        imagesInViewRef.current.set(imageKeyStr, imageInViewItem);

        handleLoad(imageInViewItem);
      } else {
        imagesInViewRef.current.delete(imageKeyStr);

        handleAbort();
      }

      handleUpdateErrorsInView(imageKeyStr, entry.isIntersecting);
    };

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(handleIntersect);
      },
      {
        rootMargin: '200px 0px 500px 0px',
        threshold: 0,
      }
    );

    setIntersectionObserver(intersectionObserver);

    return () => {
      intersectionObserver.disconnect();
    };
  }, []);

  return { loader, imagesInViewRef, intersectionObserver };
});

const ReaderImageLoaderInnerProviderMemoized = memo(
  ReaderImageLoaderInnerProvider,
  (prevProps, nextProps) =>
    prevProps.value?.imageServer === nextProps.value?.imageServer &&
    prevProps.value?.globalChapterIds === nextProps.value?.globalChapterIds
);

const ReaderImageLoaderProvider = memo((props: { children: ReactNode }) => {
  const imageServer = useReaderSettings((v) => v.value.manga.imageServer);
  const globalChapterIds = useInfiniteReaderChapters((v) => v.chapters);

  return (
    <ReaderImageLoaderErrorsProvider>
      <ReaderImageLoaderInnerProviderMemoized
        value={{
          imageServer,
          globalChapterIds,
        }}
      >
        {props.children}
      </ReaderImageLoaderInnerProviderMemoized>
    </ReaderImageLoaderErrorsProvider>
  );
});

export { ReaderImageLoaderProvider, useReaderImageLoader };

export const usePreloadCurrentChapterImages = () => {
  const { data: currentChapter } = useCurrentChapter();
  const { data: activeChapter } = useActiveChapter();
  const loader = useReaderImageLoader((v) => v.loader);

  const images = useMemo(
    () =>
      currentChapter.pages.flatMap((page, pageIndex) =>
        page.map((image) => ({ ...image, page_id: pageIndex + 1 }))
      ),
    [currentChapter]
  );

  // preload current chapter on mount
  useEffect(() => {
    if (currentChapter.chapter !== activeChapter.chapter) return;

    images.forEach((image) => {
      const key = {
        chapter: currentChapter.chapter,
        chapterId: currentChapter.id,
        pageId: image.page_id,
        imageId: image.id,
      };
      loader.createImage(key);
      loader.load({
        key,
        images: {
          [IMAGE_SERVER.MAIN]: {
            src: UrlFormatter.createUrl(
              currentChapter?.server?.link ?? '',
              getChapterImagePath(image.link)
            ),
          },
          [IMAGE_SERVER.RESERVED]: {
            src: UrlFormatter.createUrl(
              currentChapter?.server?.fallback_link ?? '',
              getChapterImagePath(image.link)
            ),
          },
        },
        queue: ImageOptimizedLoaderQueueName.BACKGROUND,
      });
    });
  }, [activeChapter]);
};

export const useReaderImageLoaderStateImage = (key: ReaderImageLoaderKey | string) => {
  const loader = useReaderImageLoader((v) => v.loader);
  const snapshotRef = useRef<HTMLImageElement | null | undefined>(null);

  return useSyncExternalStore(
    useCallback(
      (cb) => {
        const subscriber = () => {
          const imageItem = loader.getStateByKey(key) ?? null;

          // "==" to handle undefined and null
          if (snapshotRef.current == imageItem?.image) return;

          snapshotRef.current = imageItem?.image;
          cb();
        };
        loader.subscribe(subscriber, key);

        return () => {
          loader.unsubscribe(subscriber);
        };
      },
      [loader, key]
    ),
    useCallback(() => {
      const imageItem = loader.getStateByKey(key);

      return imageItem?.image ?? null;
    }, [loader, key]),
    useCallback(() => undefined, [])
  );
};

export const useReaderImagerLoaderErrors = () => {
  const loader = useReaderImageLoader((v) => v.loader);
  const imagesInViewRef = useReaderImageLoader((v) => v.imagesInViewRef);
  const errorActions = useReaderImageLoaderErrorsInViewActions();
  const errorState = useReaderImageLoaderErrorsInViewState();

  useEffect(() => {
    const subscriber: ImageOptimizedLoaderSubscriberFunction<ReaderImageLoaderKey> = (
      imageItems: ImageOptimizedLoaderStateItem<ReaderImageLoaderKey>[]
    ) => {
      imageItems.forEach((it) => {
        if (
          it.status === ImageOptimizedLoaderStateStatus.ERROR &&
          imagesInViewRef.current.has(loader.serializeKey(it.key))
        ) {
          errorActions.add(loader.serializeKey(it.key));
          return;
        }

        errorActions.remove(loader.serializeKey(it.key));
      });
    };

    loader.subscribe(subscriber);

    return () => {
      loader.unsubscribe(subscriber);
    };
  }, []);

  return !!errorState.size;
};
