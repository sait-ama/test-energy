import { ReactNode, useMemo } from 'react';

import { HeroCard } from '~entities/inventory/ui/hero-card';
import { HeroCardPreviewModalTrigger } from '~entities/inventory/ui/hero-card-preview';
import { AvatarItemImage } from '~entities/inventory/ui/item/avatar-item';
import { FrameItemImage } from '~entities/inventory/ui/item/frame-item';
import { WallpaperItemImage } from '~entities/inventory/ui/item/wallpaper-item';
import { UserSnapshotPreviewModalTrigger } from '~entities/user/ui/user-snapshot-preview/user-snapshot-preview-trigger';
import {
  UnifiedInventoryItemSchema,
  UnifiedInventoryItemSchemaFabric,
  UnifiedInventoryItemTypeSchema,
} from '~shared/api/models/inventory';
import { useSession } from '~shared/lib/session/use-session';
import { exhaustiveCheck } from '~shared/utils/exhaustive-check';

export interface UnifiedItemViewProps {
  type: UnifiedInventoryItemTypeSchema;
  model: UnifiedInventoryItemSchema;
  className?: string;
}

// refactor item images etc.
export const UnifiedItemView = (props: UnifiedItemViewProps) => {
  const { type, model, className } = props;

  const inner = useMemo(() => {
    switch (type) {
      case 'card':
        const cardModel = model as UnifiedInventoryItemSchemaFabric[typeof type];

        return <HeroCard card={cardModel.card} className={className} />;
      case 'avatar':
        const avatarModel = model as UnifiedInventoryItemSchemaFabric[typeof type];

        return (
          <AvatarItemImage
            alt="avatar"
            avatarSrc={avatarModel.image_item.image.high}
            className={className}
          />
        );

      case 'wallpaper':
        const wallpaperModel = model as UnifiedInventoryItemSchemaFabric[typeof type];

        return (
          <WallpaperItemImage src={wallpaperModel.image_item.image.high} className={className} />
        );
      case 'frame':
        const frameModel = model as UnifiedInventoryItemSchemaFabric[typeof type];

        return <FrameItemImage imgSrc={frameModel.image_item.image.high} className={className} />;
      default:
        exhaustiveCheck(type);
        return null;
    }
  }, [model, type]);

  return inner;
};

export interface UnifiedItemModalTriggerProps {
  type: UnifiedInventoryItemTypeSchema;
  model: UnifiedInventoryItemSchema;
  children: ReactNode;
}

export const UnifiedItemModalTrigger = (props: UnifiedItemModalTriggerProps) => {
  const { type, model, children } = props;

  const session = useSession() || {};

  const inner = useMemo(() => {
    switch (type) {
      case 'card':
        const cardModel = model as UnifiedInventoryItemSchemaFabric[typeof type];

        return (
          <HeroCardPreviewModalTrigger card={cardModel.card}>
            {children}
          </HeroCardPreviewModalTrigger>
        );
      case 'avatar':
      case 'wallpaper':
      case 'frame':
        const customizationModel = model as UnifiedInventoryItemSchemaFabric[typeof type];

        return (
          //@ts-ignore
          <UserSnapshotPreviewModalTrigger
            model={{ ...session, [type]: customizationModel.image_item.image }}
          >
            {children}
          </UserSnapshotPreviewModalTrigger>
        );
      default:
        exhaustiveCheck(type);
        return null;
    }
  }, [model, type]);

  return inner;
};
