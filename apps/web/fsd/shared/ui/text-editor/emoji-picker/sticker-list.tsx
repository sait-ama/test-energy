import { Fragment, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import Lock from '@re/ui-kit/icons/lock';
import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';
import { SkeletonSlot } from '@re/ui-kit/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@re/ui-kit/ui/tabs';
import { cn } from '@re/ui-kit/utils/cn';
import { skipToken, useQuery } from '@tanstack/react-query';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { api } from '~shared/api/$api';
import type { ShopItemSchemaPack } from '~shared/api/models/shop';
import { shopCatalog, ShopItemTypes, ShopPaginatedListOrderings } from '~shared/api/models/shop';
import { Features } from '~shared/config/feature-flags';
import { useCookie } from '~shared/hooks/use-cookie';
import { useSession } from '~shared/lib/session/use-session';
import type { ResponseResults } from '~shared/types/buisines';
import { EmptyView } from '~shared/ui/empty-view';
import { StickerPickerGroup } from '~shared/ui/text-editor/emoji-picker/sticker-picker-group';
import { UrlFormatter } from '~shared/utils/url-formatter';

export type HandlePickHandler = (props: {
  dispatch: () => void;
  pack: ShopItemSchemaPack['emoji_pack'];
  shopDir: string;
  canUse: boolean;
}) => void;

export const StickerList = ({
  asParent,
  handlePick,
  withoutStickers: stickerDisabledProp,
}: {
  asParent?: boolean;
  withoutStickers?: boolean;
} & { handlePick: HandlePickHandler }) => {
  const session = useSession();
  const [lastPreset, setLastPreset] = useCookie('sticker-picker-filter-preset');
  const [lastEmojiIndex, setLastEmojiIndex] = useCookie('cur-emoji-index');
  const [lastStickerIndex, setLastStickerIndex] = useCookie('cur-sticker-index');
  const features = useSiteConfig()?.features;

  const emojisEnabled = features[Features.EMOJIS]!;
  const stickersEnabled = features[Features.STICKERS]!;
  const withoutStickers = !stickersEnabled || stickerDisabledProp;

  const [isEmoji, setIsEmoji] = useState(withoutStickers ? true : lastPreset === 'emojis');
  const [currentIndex, setCurrentIndex] = useState(() =>
    isEmoji ? Number(lastEmojiIndex || 0) : Number(lastStickerIndex || 0)
  );

  const showTabs = !withoutStickers && stickersEnabled && emojisEnabled;

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const navRefs = useRef<(HTMLDivElement | null)[]>([]);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { data, isPlaceholderData, isFetched } = useQuery<ResponseResults<ShopItemSchemaPack[]>>({
    queryKey: ['sticker-picker', { query: { isEmoji } }],
    queryFn: !session
      ? skipToken
      : () =>
          api.get<ResponseResults<ShopItemSchemaPack[]>>(
            shopCatalog({
              is_emoji: isEmoji,
              type: ShopItemTypes.PACK,
              ordering: ShopPaginatedListOrderings.IS_BOUGHT_FIRST,
            })
          ),
    enabled: !!session && (emojisEnabled || stickersEnabled),
    staleTime: 300_000,
    gcTime: 300_000,
  });

  useEffect(() => {
    if (withoutStickers) {
      setLastPreset('emojis');
      setIsEmoji(true);
    }
  }, [withoutStickers, setLastPreset]);

  // useEffect(() => {
  //     // setCurrentIndex(0);
  // }, [data?.results]);
  const scrollToElement = (index: number) => {
    const safeIndex = Math.max(0, Math.min(index, (data?.results?.length ?? 0) - 1));
    setCurrentIndex(safeIndex);

    contentRefs.current[safeIndex]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
    if (isEmoji) {
      setLastEmojiIndex(String(index));
    } else {
      setLastStickerIndex(String(safeIndex));
    }

    const navElement = navRefs.current[safeIndex];
    const container = scrollAreaRef.current;

    if (navElement && container) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = navElement.getBoundingClientRect();

      const scrollLeft =
        elementRect.left - containerRect.left - (containerRect.width - elementRect.width) / 2;

      container.scrollTo({
        left: container.scrollLeft + scrollLeft,
        behavior: 'smooth',
      });
    }
  };
  useEffect(() => {
    if (isEmoji) {
      if (lastEmojiIndex) {
        scrollToElement(+lastEmojiIndex);
      }
    } else if (lastStickerIndex) {
      scrollToElement(+lastStickerIndex);
    }
  }, []);

  const getNavItemClass = (index: number) =>
    cn(
      'relative cursor-pointer border border-transparent hover:opacity-80 transition-all duration-200 rounded-sm p-1',
      {
        'scale-100 border-primary': index === currentIndex,
        'scale-100 border-transparent': index !== currentIndex,
      }
    );

  if (!emojisEnabled && !stickersEnabled) return null;
  if (!session) return null;

  const shopItems = data?.results || [];
  const Comp = asParent ? Fragment : 'div';
  const containerProps = asParent
    ? undefined
    : { className: 'h-26 min-h-[300px] w-80 px-4 pl-2 flex flex-col gap-1' };

  return (
    <Comp {...containerProps}>
      <ScrollArea ref={scrollAreaRef} className="mr-1 pb-2">
        <div className="m-1 flex w-max gap-[6px]">
          {shopItems.map(({ emoji_pack, is_bought, cost }, index) => (
            <SkeletonSlot
              force={currentIndex + index}
              key={emoji_pack.id}
              className="size-10 rounded-sm"
              show={isPlaceholderData}
              render={
                <div
                  // @ts-ignore
                  ref={(el) => (navRefs.current[index] = el)}
                  className={getNavItemClass(index)}
                  onClick={() => scrollToElement(index)}
                >
                  <Image
                    loading="lazy"
                    className="block size-10 rounded-sm transition-transform duration-150 hover:scale-110"
                    alt={`Пак ${emoji_pack.name}`}
                    src={UrlFormatter.media(emoji_pack.cover.high)}
                    width={45}
                    height={45}
                  />
                  {!is_bought && cost > 0 && (
                    <Lock size={10} className="absolute right-0 bottom-0 text-white shadow-2xl" />
                  )}
                </div>
              }
            ></SkeletonSlot>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {isFetched && !shopItems.length ? (
        <EmptyView height="300px" text="Пока пусто" emoji="༼ つ ◕_◕ ༽つ" isEmpty />
      ) : (
        <ScrollArea className="h-[325px]">
          {shopItems.map(({ emoji_pack, is_bought, dir, cost }, index) => (
            <StickerPickerGroup
              index={index}
              key={emoji_pack.id}
              // @ts-ignore
              ref={(el) => (contentRefs.current[index] = el)}
              pack={emoji_pack}
              shopItemDir={dir}
              canUse={is_bought || !cost}
              // onActive={scrollToElement}
              isLoading={isPlaceholderData}
              handlePick={handlePick}
            />
          ))}
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      )}

      {showTabs && (
        <Tabs
          value={isEmoji ? 'emojis' : 'stickers'}
          onValueChange={(value) => {
            setLastPreset(value);
            setIsEmoji(value === 'emojis');
            setCurrentIndex(0);
          }}
        >
          <TabsList className="mx-auto mt-2 flex items-center gap-1.5">
            <TabsTrigger value="stickers">Стикеры</TabsTrigger>
            <TabsTrigger value="emojis">Эмодзи</TabsTrigger>
          </TabsList>
        </Tabs>
      )}
    </Comp>
  );
};
