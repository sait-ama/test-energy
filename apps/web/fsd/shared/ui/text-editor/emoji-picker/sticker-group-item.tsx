import Link from 'next/link';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import Lock from '@re/ui-kit/icons/lock';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { ShopItemImage } from '~entities/shop/ui/shop-item-image';
import type { EmojiSchema } from '~shared/api/models/shop';
import { ShopItemTypes } from '~shared/api/models/shop';
import { Routing } from '~shared/config/routing';
import { STICKER_COMMAND } from '~shared/ui/text-editor/text-editor';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { UrlFormatter } from '~shared/utils/url-formatter';

const CannotBuyWarning = ({ shopItemDir }: { shopItemDir: string }) => (
  <div className="flex gap-4">
    <ReText>Посетите</ReText>
    <Link
      prefetch={false}
      className="text-primary hover:underline"
      href={Routing.Shop.catalog({ tab: 'feed', item: shopItemDir, type: ShopItemTypes.PACK })}
    >
      магазин
    </Link>
  </div>
);
export const StickerGroupItem = (
  props: EmojiSchema & { isLoading?: boolean; canUse?: boolean; shopItemDir: string }
) => {
  const {
    image: { high: imgSource = '' },
    isLoading,
    shopItemDir,
    name,
    id,
    canUse,
  } = props;
  const [editor] = useLexicalComposerContext();
  return (
    <div
      className={cn('relative p-3 transition-all duration-200', { 'hover:scale-[1.2]': canUse })}
    >
      <ShopItemImage
        role="button"
        aria-label={`выбрать стикер ${name}`}
        containerClassName="w-[86px] h-[86px] hover:none"
        onClick={async () => {
          const toast = await importToastAsync();

          if (canUse)
            editor.dispatchCommand(STICKER_COMMAND, { emoji: UrlFormatter.media(imgSource) });
          else {
            toast.info(<CannotBuyWarning shopItemDir={shopItemDir} />);
          }
        }}
        imgSrc={UrlFormatter.media(isLoading ? imgSource : '')}
        alt={`эмодзи_${name}`}
        type={ShopItemTypes.PACK}
        avatarSrc={null}
        unoptimized={imgSource.endsWith('.gif')}
        className="bg-secondary mx-auto w-[100px] cursor-pointer rounded-xs"
        height={100}
        key={id}
        width={100}
      />
      {!canUse && (
        <span className="bg-secondary absolute top-0 right-0 rounded-full p-1">
          <Lock size={16} />
        </span>
      )}
    </div>
  );
};
