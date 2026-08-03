import { useCallback } from 'react';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { useOpenStickerPreviewAction } from '~features/activity/model/actions';
import { Features } from '~shared/config/feature-flags';
import { HandlePickHandler } from '~shared/ui/text-editor/emoji-picker/sticker-list';
import { StickerPickerAsync } from '~shared/ui/text-editor/emoji-picker/sticker-picker.async';

export const ActivityStickerPicker = ({ withoutStickers }: { withoutStickers?: boolean }) => {
  const handleOpen = useOpenStickerPreviewAction();
  const handlePick: HandlePickHandler = useCallback(
    ({ canUse, dispatch, shopDir: shopItemDir }) => {
      if (canUse) dispatch();
      else {
        handleOpen(shopItemDir);
      }
    },
    []
  );
  const features = useSiteConfig()?.features;
  if (!features[Features.EMOJIS] && !features[Features.STICKERS]) return null;
  return <StickerPickerAsync withoutStickers={withoutStickers} handlePick={handlePick} />;
};
