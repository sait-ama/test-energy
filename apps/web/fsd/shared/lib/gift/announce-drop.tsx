import Activity from '@re/ui-kit/icons/activity';
import { ReText } from '@re/ui-kit/ui/text';

import { HeroCardDrop } from '~features/hero-card-drop/ui/hero-card-drop';
import { GiftType } from '~shared/api/models/gift';
import type { HeroCardSchema } from '~shared/api/models/inventory';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { valueIs } from '~shared/utils/valueIs';

import { useDroppedGifts } from './use-dropped-gifts';

export enum RewardAction {
  LOGIN = 'login',
  COMMENT = 'comment',
  READING = 'reading',
  RATING = 'rating',
}

export enum RewardType {
  COINS = 'coins',
  CARD = 'card',
}

export interface RewardSchema {
  action: RewardAction;
  type: RewardType;
  value: number | HeroCardSchema;
}

const CardDropView = ({
  toastId,
  card,
  action,
}: {
  toastId: number | string;
  card: HeroCardSchema;
  action: RewardAction;
}) => {
  const handlePreviewOpen = async () => {
    const toast = await importToastAsync();

    toast.dismiss(toastId);
    const store = useDroppedGifts.getState();
    store.setGift({ type: GiftType.CARD, value: card }, action);
    store.setShow(true);
  };

  return (
    <HeroCardDrop
      card={card}
      onPreviewOpen={async () => {
        await handlePreviewOpen();
      }}
    />
  );
};

const actionMap: Record<RewardAction, string> = {
  [RewardAction.COMMENT]: 'комментарий',
  [RewardAction.LOGIN]: 'вход на сайт',
  [RewardAction.READING]: 'чтение',
  [RewardAction.RATING]: 'оценку тайтла',
};

const CoinsDropView = ({
  value,
  action,
}: {
  toastId: number | string;
  value: number;
  action: RewardAction;
}) => {
  return (
    <div className="flex items-center justify-center gap-2 rounded-md p-4">
      <Activity />
      <ReText className="leading-none" size="sm">
        Вы получили {value} молний за {actionMap[action]}
      </ReText>
    </div>
  );
};

export const announceDrop = async (drops: RewardSchema[]) => {
  const toast = await importToastAsync();

  // const isMobile = matchMedia(`(max-width: ${breakpoints.sm}px)`).matches;

  for (const drop of drops) {
    toast.custom(
      (toastId) => {
        if (valueIs(drop.value, drop.type === RewardType.COINS)) {
          return (
            <CoinsDropView action={drop.action} toastId={toastId} value={drop.value as number} />
          );
        }

        return (
          <CardDropView
            toastId={toastId}
            card={drop.value as HeroCardSchema}
            action={drop.action}
          />
        );
      },
      {
        duration: 2500,
        // style: {
        //   marginBottom: isMobile ? 70 : undefined,
        // },
      }
    );
  }
};
