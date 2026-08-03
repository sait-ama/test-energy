import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';

import { InventoryTab as InventoryTabName } from '~pages/(user)/inventory-tab/model/const';
import { useCustomizationType } from '~pages/(user)/inventory-tab/ui/customization/model/state';

const ThemesTab = dynamic(() =>
  import('~pages/(user)/inventory-tab/ui/customization/fragments/themes-tab').then(
    (v) => v.ThemesTab
  )
);
const EmojiTab = dynamic(() =>
  import('../../ui/customization/fragments/emoji-tab').then((v) => v.EmojiTab)
);

const FramesTab = dynamic(() =>
  import('../../ui/customization/fragments/frames-tab').then((v) => v.FramesTab)
);
const WallpapersTab = dynamic(() =>
  import('../../ui/customization/fragments/wallpapers-tab').then((v) => v.WallpapersTab)
);
const AvatarsTab = dynamic(() =>
  import('../../ui/customization/fragments/avatars-tab').then((v) => v.AvatarsTab)
);
export const CustomizationTab = () => {
  const [value] = useCustomizationType();

  return useMemo(() => {
    switch (value) {
      case InventoryTabName.AVATARS:
        return <AvatarsTab />;
      case InventoryTabName.FRAMES:
        return <FramesTab />;
      case InventoryTabName.WALLPAPERS:
        return <WallpapersTab />;
      case InventoryTabName.EMOJI:
        return <EmojiTab />;
      case InventoryTabName.THEMES:
        return <ThemesTab />;
      default: {
        return <AvatarsTab />;
      }
    }
  }, [value]);
};
