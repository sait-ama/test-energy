import React, { useRef } from 'react';
import Image from 'next/image';

import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import { useCurrentChapter } from '~entities/reader/model/hooks';
import { SubscriptionModalContent } from '~features/premium-subscription-modal/ui/subscription-modal-content';
import { InfoModalType } from '~shared/api/models/info-modal';
import type { YandexAdvertisingProps } from '~shared/lib/ad/yandex-adverisement';
import { YandexAdvertising } from '~shared/lib/ad/yandex-adverisement';
import { useInfoModal } from '~shared/lib/info-modal/use-info-modal';
import { useSession } from '~shared/lib/session/use-session';
import { Container } from '~shared/ui/container';
import { UrlFormatter } from '~shared/utils/url-formatter';

const AdblockBanner = () => {
  return (
    <div className="bg-secondary relative flex justify-center overflow-hidden rounded-md p-1">
      <Image
        width="276"
        height="276"
        src={UrlFormatter.media('public/app/remanga.webp')}
        alt="logo"
        className="pointer-events-none absolute top-0 left-0 h-[276px] w-[276px] -translate-x-1/4 -translate-y-1/2 opacity-[0.02] select-none"
      />
      <Image
        width="276"
        height="276"
        src={UrlFormatter.media('public/app/remanga.webp')}
        alt="logo"
        className="pointer-events-none absolute right-0 bottom-0 h-[276px] w-[276px] translate-x-1/4 translate-y-1/2 opacity-[0.02] select-none"
      />
      <div className="relative flex flex-col items-center gap-5 p-4 md:flex-row md:p-1">
        <Image
          alt="adblock chan"
          src={UrlFormatter.media('public/adblock-girl.webp')}
          width={175}
          height={175}
        />
        <div className="flex flex-col gap-3">
          <ReText size="xl" weight="semibold">
            Поддержите наш проект! 🔥
          </ReText>
          <ReText color="muted-foreground" weight="medium">
            Мы заметили, что у вас включен <span className="text-foreground">AdBlock</span>.<br />
            Отключите его для нашего сайта,
            <br />
            чтобы помочь нам продолжать работу и развивать сервис.
            <span className="text-foreground">Спасибо!</span> ❤️
          </ReText>
        </div>
      </div>
    </div>
  );
};

export const Advertising = (props: Pick<YandexAdvertisingProps, 'index'>) => {
  const is_premium = useSession()?.is_premium;
  const is_staff = useSession()?.is_staff;
  const {
    data: { id, is_paid },
  } = useCurrentChapter();
  const { open } = useInfoModal();
  // const [isMounted, setIsMounted] = useState(false);

  const adRef = useRef<HTMLDivElement>(null);

  if (is_premium || is_staff || is_paid) return null;

  // const handleMount = () => setIsMounted(true);

  const handleDisableAdvertising = () => {
    open({
      type: InfoModalType.CUSTOM,
      content: (
        <div className="relative flex w-full max-w-full flex-col items-center justify-center overflow-auto rounded-md">
          <SubscriptionModalContent />
        </div>
      ),
      srOnly: 'Отключение рекламы',
    });
  };

  return (
    <Container slim className="z-[1000]">
      {/*{isBlocked ? <AdblockBanner /> : null}*/}
      {/* Если неправильно отработает детект - все равно показать рекламу */}
      <YandexAdvertising slug={id} {...props} ref={adRef} />
      <Button className="w-full rounded-[0]" variant="secondary" onClick={handleDisableAdvertising}>
        Отключить рекламу
      </Button>
    </Container>
  );
};
