import { lazy } from 'react';

import { DialogLoading } from '@re/ui-kit/ui/dialog-loading';
import { useSuspenseQuery } from '@tanstack/react-query';

import { getShopItemByDirSuspenseQuery } from '~entities/shop/model/queries';
import { isEmojiPack } from '~features/shop-feed/ui/shop-emoji-pack';
import { ShopFeedItemPreviewProvider } from '~features/shop-feed/ui/shop-feed-item-preview/model/context';
import { InfoModalType } from '~shared/api/models/info-modal';
import { useInfoModal } from '~shared/lib/info-modal/use-info-modal';
import {
  QuerySuspenseContainer,
  StaticFallback,
} from '~shared/lib/react-query/query-suspense-container';

const ShopEmojiPack = lazy(() =>
  import(/* webpackChunkName: "ShopEmojiPack" */ '~features/shop-feed/ui/shop-emoji-pack').then(
    (v) => ({ default: v.ShopEmojiPack })
  )
);
const ShopByDirItemContent = ({ shopItemDir }: { shopItemDir: string }) => {
  const { data: shopItem } = useSuspenseQuery({
    ...getShopItemByDirSuspenseQuery({ variables: { params: { shopItemDir } } }),
  });
  if (isEmojiPack(shopItem)) {
    return <ShopEmojiPack shopItem={shopItem} />;
  }
  return null;
};

//todo перенести в shared
export const useOpenStickerPreviewAction = () => {
  const open = useInfoModal((v) => v.open);
  return (shopItemDir: string) => {
    open({
      type: InfoModalType.CUSTOM,
      srOnly: 'Элемент кастомизации',
      content: (
        <QuerySuspenseContainer
          fallback={<DialogLoading key="loader" />}
          fallbackRender={(args) => <StaticFallback {...args} />}
        >
          <ShopFeedItemPreviewProvider key="shop-item-preview">
            <ShopByDirItemContent shopItemDir={shopItemDir} />
          </ShopFeedItemPreviewProvider>
        </QuerySuspenseContainer>
      ),
      // @ts-ignore
      contentProps: { className: 'w-fit max-w-auto' },
    });
  };
};
