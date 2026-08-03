import { useEffect } from 'react';

import { ReText } from '@re/ui-kit/ui/text';

import { HeroCardPreviewModal } from '~entities/inventory/ui/hero-card-preview';
import { ReaderPromoSimple } from '~features/reader-promo-modal/ui/reader-promo-simple';
import { AuthTypes } from '~shared/api/models/auth';
import { GiftType } from '~shared/api/models/gift';
import { useLocalStorageState } from '~shared/hooks/use-local-storage-state';
import { useOnReroute } from '~shared/hooks/use-on-reroute';
import { useAuthModal } from '~shared/lib/auth/use-auth-modal';
import { RewardAction } from '~shared/lib/gift/announce-drop';
import { useDroppedGifts } from '~shared/lib/gift/use-dropped-gifts';
import { useLogged } from '~shared/lib/session/use-logged';
import { useSession } from '~shared/lib/session/use-session';
import { LinkBase } from '~shared/ui/link-base';

import { REGISTER_GIFT } from '../model/const';
import { showRegisterGift } from '../model/utils';

const RegisterGiftModal = () => {
  const { show, setShow, setGift } = useDroppedGifts();

  const { open: openAuthModal } = useAuthModal();

  const isLogged = useLogged();

  const [registerGiftStore, setRegisterGiftStore] = useLocalStorageState<{
    show: boolean;
  }>('register-gift-store', {
    show: true,
  });

  useOnReroute(() => setShow(false));

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isLogged) return;

    const timeout = setTimeout(() => {
      if (!registerGiftStore?.show) return;
      showRegisterGift();
      setRegisterGiftStore({
        show: false,
      });
    }, 600_000); // 10 min

    return () => {
      clearTimeout(timeout);
    };
  }, [isLogged]);

  const handleClick = () => {
    openAuthModal({ authType: AuthTypes.REGISTER });
    setShow(false);
    setGift(null);
  };

  return (
    <HeroCardPreviewModal
      open={show}
      onOpenChange={setShow}
      card={REGISTER_GIFT}
      overrides={{
        fullContent: (
          <div className="mb-5 flex flex-col items-center gap-3">
            <ReText weight="semibold" size="lg">
              Вам выпала карточка!
            </ReText>
            <LinkBase>
              <ReText align="center" onClick={handleClick}>
                ПОЛУЧИТЬ
              </ReText>
            </LinkBase>
          </div>
        ),
      }}
    />
  );
};

const HeroCardGiftModal = () => {
  const { show, gift, action, setShow } = useDroppedGifts();
  const session = useSession();
  const showPromo = action === RewardAction.READING && !session?.is_premium && !session?.is_staff;

  if (!gift?.value) return null;

  return (
    <HeroCardPreviewModal
      open={show}
      onOpenChange={setShow}
      card={gift.value}
      underCardComponent={
        showPromo ? (
          <ReaderPromoSimple placement="getting_card" onSubmit={() => setShow(false)} />
        ) : null
      }
    />
  );
};

export const GiftModal = () => {
  const { gift } = useDroppedGifts();
  const isLogged = useLogged();

  if (!isLogged) {
    return <RegisterGiftModal />;
  }

  switch (gift?.type) {
    case GiftType.CARD:
      return <HeroCardGiftModal />;
    default:
      return null;
  }
};
