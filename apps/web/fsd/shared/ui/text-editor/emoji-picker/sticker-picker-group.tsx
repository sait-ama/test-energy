import { useCallback, useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

import Lock from '@re/ui-kit/icons/lock';
import { SkeletonSlot } from '@re/ui-kit/ui/skeleton';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import type { EmojiPackSchema } from '~shared/api/models/shop';
import Title from '~shared/assets/placeholders/title';
import { ImageContent, ImageFallback, ImageRoot } from '~shared/ui/image';
import type { HandlePickHandler } from '~shared/ui/text-editor/emoji-picker/sticker-list';
import { STICKER_COMMAND } from '~shared/ui/text-editor/text-editor';
import { UrlFormatter } from '~shared/utils/url-formatter';

export interface EmojiPickerGroupProps {
  pack: EmojiPackSchema;
  shopItemDir: string;
  index: number;
  isLoading?: boolean;
  onInView?: () => void;
  handlePick: HandlePickHandler;
  canUse: boolean;
  onActive: (index: number) => void;
}

export const StickerPickerGroup = ({
  ref,
  pack: { name = '', emojis = [], is_emoji = false },
  onActive,
  index,
  canUse,
  shopItemDir,
  isLoading,
  onInView,
  handlePick,
}: EmojiPickerGroupProps & {
  ref?: React.RefObject<HTMLDivElement>;
}) => {
  const [editor] = useLexicalComposerContext();
  const {
    ref: inViewRef,
    inView,
    entry,
  } = useInView({
    threshold: 0.5,
    rootMargin: '-40% 0px -40% 0px',
    delay: 100,
  });
  // Объединение refs
  const combinedRef = useCallback(
    (node: HTMLDivElement) => {
      inViewRef(node);
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [inViewRef, ref]
  );

  useEffect(() => {
    if (inView && entry) {
      const root = entry.rootBounds;
      const rect = entry.boundingClientRect;
      const visibility = Math.min(
        1,
        (rect.height -
          Math.max(0, root!.top - rect.top) -
          Math.max(0, rect.bottom - root!.bottom)) /
          rect.height
      );

      if (visibility > 0.7 && onActive) {
        onActive(index);
      }
    }
  }, [inView, entry, onActive, index]);

  const handleEmojiClick = useCallback(
    (imgSource: string) => {
      handlePick({
        dispatch: () => {
          editor.dispatchCommand(STICKER_COMMAND, {
            src: imgSource,
            is_emoji,
            shopItemDir,
          });
        },
        pack: { name, emojis, is_emoji },
        shopDir: shopItemDir,
        canUse,
      });
    },
    [handlePick, editor, is_emoji, shopItemDir, name, emojis, canUse]
  );

  const renderEmojiItem = useCallback(
    (
      { image: { high: imgSource = '' } = {}, name: emojiName }: (typeof emojis)[number],
      index: number
    ) => {
      if (!imgSource) return null;

      return (
        <div
          role="button"
          aria-label={`Выбрать ${is_emoji ? 'эмодзи' : 'стикер'} ${emojiName}`}
          className="relative aspect-square h-auto w-full"
          key={`${imgSource}-${index}`}
          onClick={() => handleEmojiClick(imgSource)}
        >
          <ImageRoot
            className={cn(
              'bg-secondary/60 relative aspect-square h-full w-full rounded-sm transition-all duration-200 hover:scale-[1.1]',
              {
                'pointer-events-none': !canUse,
              }
            )}
            src={UrlFormatter.media(imgSource)}
          >
            <ImageContent
              className="rounded-sm"
              style={!canUse ? { filter: 'brightness(.6)' } : undefined}
              alt={`${is_emoji ? 'Эмодзи' : 'Стикер'} ${emojiName}`}
              fill
            />
            {!canUse && (
              <span className="absolute inset-0 z-[10] flex items-center justify-center opacity-70">
                <Lock className="text-white shadow-2xl" />
              </span>
            )}
            <ImageFallback className="z-[2]">
              <Title size={40} />
            </ImageFallback>
          </ImageRoot>
        </div>
      );
    },
    [canUse, handleEmojiClick, is_emoji]
  );

  const gridClasses = useMemo(
    () =>
      cn('grid gap-2 w-full grid-cols-4 sm:grid-cols-4 md:grid-cols-4 mt-2', {
        'grid-cols-5 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5':
          is_emoji,
      }),
    [is_emoji]
  );

  return (
    <div ref={combinedRef} className="mb-2 flex flex-col gap-2">
      <SkeletonSlot
        containerClassName="self-start"
        className="h-4 w-[160px]"
        show={isLoading}
        render={
          <ReText align="start" weight="medium" size="md" lineClamp={1} color="muted-foreground">
            {name}
          </ReText>
        }
      />

      <div className={gridClasses}>{emojis?.map(renderEmojiItem)}</div>
    </div>
  );
};

StickerPickerGroup.displayName = 'EmojiPickerGroup';
