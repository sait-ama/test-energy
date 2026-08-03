'use client';
import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import { UserRepository } from '~entities/user/model/repository';
import { ShopItemTypes } from '~shared/api/models/shop';
import { Routing } from '~shared/config/routing';
import { useAccountModal } from '~shared/lib/account/use-account-modal';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { useSession } from '~shared/lib/session/use-session';
import { useTour } from '~shared/lib/tour/root';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { arrayOptional } from '~shared/utils/array-optional';
import { CookieService } from '~shared/utils/cookie-service';
import { UrlFormatter } from '~shared/utils/url-formatter';

const TOUR_COOKIE_NAME = 'new-version-tour-toast';
const GIFT_COOKIE_NAME = 'new-version-tour-gift';

export const useNewVersionTour = () => {
  const session = useSession();

  const accountModalStore = useAccountModal();

  const { startTour, stopTour, isOpen } = useTour({ tourId: 'new-version-tour' });

  const openAccountModal = () => {
    accountModalStore.freezeOpen(true);
  };

  const closeAccountModal = () => {
    accountModalStore.unfreezeOpen(false);
  };

  const router = useRouter();

  useEffect(() => {
    accountModalStore.unfreezeOpen();
  }, [isOpen]);

  const handleClick = () => {
    const hasTourReward = !!CookieService.get(GIFT_COOKIE_NAME);

    startTour({
      groups: {
        'home-page-menu': {
          beforeStepAsync: () => {
            openAccountModal();
          },
          afterStepAsync: () => closeAccountModal(),
        },
        'shop-page': {
          beforeStepAsync: () =>
            router.push(
              Routing.Shop.catalog({
                params: { tab: 'feed', type: ShopItemTypes.DECK },
              })
            ),
        },
        'user-page': {
          beforeStepAsync: () => {
            const route = Routing.User.detail({ params: { id: session?.id! } });
            router.push(route);
          },
        },
        'user-inventory-page': {
          beforeStepAsync: () => {
            const route = Routing.User.detail({ params: { id: session?.id!, tab: 'inventory' } });
            router.push(route);
          },
        },
      },
      steps: [
        {
          target: 'profile-menu',
          position: 'top',
          content: (
            <div className="flex items-center gap-4">
              <Image
                src={UrlFormatter.media('public/tours/new-version/greeting.webp')}
                alt="Приветственное изображение"
                width={100}
                height={120}
                className="hidden sm:block"
              />
              <div className="flex flex-col gap-1">
                <ReText weight="bold">Мы обновили сайт!</ReText>
                <ReText color="muted-foreground" size="sm">
                  Хотим показать, что изменилось. Начнём с твоего профиля! Следуй за мной, чтобы
                  узнать больше, или закрой это окно — к гайду можно вернуться в любое время.
                </ReText>
              </div>
            </div>
          ),
          stepInteraction: false,
        },
        {
          target: 'profile-menu-guide',
          content: (
            <div className="flex items-center gap-4">
              <Image
                src={UrlFormatter.media('public/tours/new-version/greeting.webp')}
                alt="Приветственное изображение"
                width={100}
                height={120}
                className="hidden sm:block"
              />
              <div className="flex flex-col gap-1">
                <ReText weight="bold">Ты сможешь в любое время перепройти гайд</ReText>
                <ReText color="muted-foreground" size="sm">
                  Если ты уже получил подарок, повторно получить его нельзя(
                </ReText>
              </div>
            </div>
          ),
          stepInteraction: false,
          group: 'home-page-menu',
        },
        {
          target: 'profile-menu-coins',
          content: (
            <div className="flex items-center gap-4">
              <Image
                src={UrlFormatter.media('public/tours/new-version/greeting.webp')}
                alt="Приветственное изображение"
                width={100}
                height={120}
                className="hidden sm:block"
              />
              <div className="flex flex-col gap-1">
                <ReText weight="bold">У нас появилась новая валюта</ReText>
                <ReText color="muted-foreground" size="sm">
                  Видишь? Теперь у тебя появились не только тикеты, которые ты можешь потратить на
                  чтение глав, но и новая валюта — молнии! Их можно обменивать в магазине на
                  кастомизацию профиля, коллекционные колоды карт и другие приятные сюрпризы.
                </ReText>
              </div>
            </div>
          ),
          stepInteraction: false,
          group: 'home-page-menu',
        },
        {
          target: 'profile-menu-shop-item',
          content: (
            <div className="flex items-center gap-4">
              <Image
                src={UrlFormatter.media('public/tours/new-version/greeting.webp')}
                alt="Приветственное изображение"
                width={100}
                height={120}
                className="hidden sm:block"
              />
              <div className="flex flex-col gap-1">
                <ReText weight="bold">Магазин?! Магазин</ReText>
                <ReText color="muted-foreground" size="sm">
                  А вот и место, где ты можешь обменять накопленные молнии на разные приятные вещи.
                  Давай посмотрим, что там есть.
                </ReText>
              </div>
            </div>
          ),
          group: 'home-page-menu',
          stepInteraction: false,
        },
        {
          target: 'shop-coins-balance',
          content: (
            <div className="flex items-center gap-4">
              <Image
                src={UrlFormatter.media('public/tours/new-version/greeting.webp')}
                alt="Приветственное изображение"
                width={100}
                height={120}
                className="hidden sm:block"
              />
              <div className="flex flex-col gap-1">
                <ReText weight="bold">Больше молний, божествам молний! </ReText>

                <ReText color="muted-foreground" size="sm">
                  Тут можно обменять всю валюту сайта на молнии. Как? Да просто нажми на «плюс».
                </ReText>
              </div>
            </div>
          ),
          stepInteraction: false,
          group: 'shop-page',
        },
        {
          target: 'shop-feed-list-item-1',
          position: 'left',
          content: (
            <div className="flex items-center gap-4">
              <Image
                src={UrlFormatter.media('public/tours/new-version/greeting.webp')}
                alt="Приветственное изображение"
                width={100}
                height={120}
                className="hidden sm:block"
              />
              <div className="flex flex-col gap-1">
                <ReText weight="bold">Ещё одно новшество – колоды карт</ReText>
                <ReText color="muted-foreground" size="sm">
                  Тут можно попробовать получить любую карту сайта. Главное – выбрать нужную колоду.
                  Иногда тут бывают очень редкие, особые ивентовые колоды. <br /> Кстати, в конце ты
                  получишь от нас одну такую колоду и рамку для аватара.
                </ReText>
              </div>
            </div>
          ),
          stepInteraction: false,
          group: 'shop-page',
        },
        {
          target: 'user-detail-about-user',
          content: (
            <div className="flex items-center gap-4">
              <Image
                src={UrlFormatter.media('public/tours/new-version/greeting.webp')}
                alt="Приветственное изображение"
                width={100}
                height={120}
                className="hidden sm:block"
              />
              <div className="flex flex-col gap-1">
                <ReText weight="bold">Новый профиль</ReText>
                <ReText color="muted-foreground" size="sm">
                  Обновлённому сайту – новый профиль! Начнём с самого заметного: уровни. Будь
                  активным на сайте, читай, комментируй и культивируй уровень.
                </ReText>
              </div>
            </div>
          ),
          stepInteraction: false,
          group: 'user-page',
        },
        {
          target: 'user-detail-about-achievements',
          content: (
            <div className="flex items-center gap-4">
              <Image
                src={UrlFormatter.media('public/tours/new-version/greeting.webp')}
                alt="Приветственное изображение"
                width={100}
                height={120}
                className="hidden sm:block"
              />
              <div className="flex flex-col gap-1">
                <ReText weight="bold">Витрина твоих достижений!</ReText>
                <ReText color="muted-foreground" size="sm">
                  Хвастайся своими бейджами и прогрессирующими ачивками! Соревнуйся с другими
                  читателями.
                </ReText>
              </div>
            </div>
          ),
          stepInteraction: false,
          group: 'user-page',
        },
        {
          position: 'top',
          target: 'user-detail-about-friends',
          content: (
            <div className="flex items-center gap-4">
              <Image
                src={UrlFormatter.media('public/tours/new-version/greeting.webp')}
                alt="Приветственное изображение"
                width={100}
                height={120}
                className="hidden sm:block"
              />
              <div className="flex flex-col gap-1">
                <ReText weight="bold">Нет, ну ты это видел?</ReText>
                <ReText color="muted-foreground" size="sm">
                  Теперь у тебя будут друзья. А ещё ты можешь показать, как относишься к ним: любовь
                  всей жизни, просто друзья, а может иное?
                </ReText>
              </div>
            </div>
          ),
          stepInteraction: false,
          group: 'user-page',
        },
        {
          position: 'top',
          target: 'user-detail-about-followers',
          content: (
            <div className="flex items-center gap-4">
              <Image
                src={UrlFormatter.media('public/tours/new-version/greeting.webp')}
                alt="Приветственное изображение"
                width={100}
                height={120}
                className="hidden sm:block"
              />
              <div className="flex flex-col gap-1">
                <ReText weight="bold">Подписчики? Да!</ReText>
                <ReText color="muted-foreground" size="sm">
                  Сам пишешь посты или хочешь читать других? Подписывайся на них, чтобы следить за
                  актуальными публикациями.
                </ReText>
                {hasTourReward ? (
                  <Button className="mt-2" size="sm" onClick={stopTour}>
                    Завершить
                  </Button>
                ) : null}
              </div>
            </div>
          ),
          stepInteraction: false,
          group: 'user-page',
          afterStepAsync: async () => {
            CookieService.set(TOUR_COOKIE_NAME, 'true');

            if (!hasTourReward) {
              await UserRepository.getTourReward({})
                .catch(resolveErrorAsync)
                .finally(() => CookieService.set(GIFT_COOKIE_NAME, 'true'));
            }
          },
        },
        ...arrayOptional(!hasTourReward, {
          position: 'top',
          target: 'user-inventory-tabs',
          group: 'user-inventory-page',
          content: (
            <div className="flex items-center gap-4">
              <Image
                src={UrlFormatter.media('public/tours/new-version/greeting.webp')}
                alt="Приветственное изображение"
                width={100}
                height={120}
              />
              <div className="flex flex-col gap-1">
                <ReText weight="bold">А вот и подарки!</ReText>
                <ReText color="muted-foreground" size="sm">
                  Они уже в твоем инвентаре, посмотри во вкладки "Рамки" и "Колоды": там ты найдешь
                  кое-что интересное!
                </ReText>
                <Button className="mt-2" size="sm" onClick={stopTour}>
                  Завершить
                </Button>
              </div>
            </div>
          ),
          stepInteraction: false,
        } as const),
      ],
    });
  };

  return handleClick;
};

const StartTourButton = () => {
  const handleStartTour = useNewVersionTour();

  const handleClick = async () => {
    handleStartTour();
    importToastAsync().then((m) => m.dismiss(TOUR_COOKIE_NAME));
  };

  return (
    <div className="text-muted-foreground flex flex-col gap-2">
      Привет! Мы обновили сайт и хотим показать, что изменилось. Готов отправиться в небольшое
      путешествие и получить подарок?
      <Button className="mt-1 self-start" size="sm" onClick={handleClick}>
        Получить 🎁
      </Button>
    </div>
  );
};

export function NewVersionTourToast() {
  const isLogged = useSession();

  useEffect(() => {
    if (!isLogged || CookieService.get(TOUR_COOKIE_NAME)) return;

    (async () => {
      const toast = await importToastAsync();

      toast('🎉 Новая версия — новый функционал!', {
        id: TOUR_COOKIE_NAME,
        duration: Infinity,
        dismissible: true,
        toasterId: 'advertising',
        closeButton: true,
        onDismiss: () => CookieService.set(TOUR_COOKIE_NAME, 'true'),
        description: <StartTourButton />,
      });
    })();
  }, [isLogged]);

  return null;
}
