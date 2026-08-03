'use client';

import { ComponentProps, memo, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useLocale, useTimeZone, useTranslations } from 'next-intl';

import CoinIcon from '@re/ui-kit/icons/activity';
import QuestionMarkIcon from '@re/ui-kit/icons/question-mark';
import TicketIcon from '@re/ui-kit/icons/ticket';
import { Badge } from '@re/ui-kit/ui/badge';
import { Button } from '@re/ui-kit/ui/button';
import { ButtonGroup } from '@re/ui-kit/ui/button-group';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@re/ui-kit/ui/dialog';
import { Switch } from '@re/ui-kit/ui/switch';
import { ReText, TextProps } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';
import { useMutation } from '@tanstack/react-query';
import confetti from 'canvas-confetti';
import dayjs from 'dayjs';
import DayJSTimezone from 'dayjs/plugin/timezone';
import { motion } from 'motion/react';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { HeroCard } from '~entities/inventory/ui/hero-card';
import { HeroCardPreviewModal } from '~entities/inventory/ui/hero-card-preview';
import { useBuyDeck } from '~entities/shop/model/mutations';
import { useDeckById } from '~entities/shop/model/queries';
import { ShopQueryKeys } from '~entities/shop/model/query-keys';
import { getItemStatus } from '~entities/shop/model/utils';
import { useShopItemByDateStatus } from '~entities/shop/ui/dates';
import { client } from '~shared/api/client';
import {
  v2InventoryDecksChooseCreateMutation,
  v2InventoryDecksOpenCreateMutation,
  v2InventoryDecksRetrieveInfiniteQueryKey,
} from '~shared/api/generated/tanstack';
import type { HeroCardSchema } from '~shared/api/models/inventory';
import type { DeckSchema } from '~shared/api/models/shop';
import { DeckType } from '~shared/api/models/shop';
import { useHeroCardModal } from '~shared/lib/card/use-card-modal';
import { useExchangeModal } from '~shared/lib/exchange/use-exchnage-modal';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { useLoggedCheck } from '~shared/lib/session/use-logged';
import { useSession } from '~shared/lib/session/use-session';
import { useGetConfirmation } from '~shared/lib/submit-action/use-submit-action';
import { TextTimer } from '~shared/lib/timer/ui/timer';
import { fallbackEmpty } from '~shared/seo/fallback-empty';
import { Container } from '~shared/ui/container';
import { FlatList as _FlatList, type FlatListType } from '~shared/ui/flat-list-v2';
import { UrlFormatter } from '~shared/utils/url-formatter';

import { DeckContextProvider, RouletteConfigSpeed, useDeckStore } from '../model/context';
import { useAvailableDecks, useChangeDeckShopItem, useDeckShopItem } from '../model/queries';

import { Arrow } from './arrow';
import { Frame } from './frame';

dayjs.extend(DayJSTimezone);

export interface CardReelProps extends ComponentProps<'div'> {
  className?: string;
}

const CardReel = memo((props: CardReelProps) => {
  const { className, children } = props;
  const { cardsList, offset } = useDeckStore((v) => v.deckHandlers);
  const isRandomMode = useDeckStore((v) => v.isRandomMode);

  return (
    <div className={cn('relative', className)}>
      {children}

      <div className="overflow-x-hidden">
        <motion.div style={{ x: offset }} className="flex items-center justify-center">
          {[...cardsList, ...cardsList, ...cardsList].map((item, index) => (
            <HeroCard
              faceDown={isRandomMode}
              card={item}
              key={index}
              className="mx-[4px] w-[100px] flex-[0_0_auto] md:w-[150px]"
            />
          ))}
        </motion.div>
      </div>
      <div className="from-background absolute top-0 left-0 z-10 h-full w-1/4 bg-gradient-to-r to-transparent" />
      <div className="from-background absolute top-0 right-0 z-10 h-full w-1/4 bg-gradient-to-l to-transparent" />
      <Frame className="absolute top-1/2 left-1/2 z-10 h-[170px] -translate-x-1/2 -translate-y-1/2 md:h-[250px]" />
    </div>
  );
});

CardReel.displayName = 'CardReel';
const DeckAvailabilityPast = ({ className, ...props }: TextProps) => {
  const t = useTranslations('pages.customization-items-page.content');
  const { data: deckShopItem } = useDeckShopItem();
  const datetimeFormat = useSiteConfig((v) => v.localization.dateFormat);
  if (!deckShopItem) return null;
  const endDate = deckShopItem.availability_start_date;
  const startDate = deckShopItem.availability_end_date;
  if (!startDate) return null;
  return (
    <Badge
      variant="secondary"
      className={cn(
        'user-select-none user-events-none flex flex-row items-center justify-center select-none',
        'gap-2.5 px-3 py-[7px]',
        'h-6 w-fit',
        'bg-white/12 backdrop-blur-[2px] hover:bg-white/30',
        'text-center text-sm leading-[17px] font-medium text-white',
        className
      )}
    >
      {t('status.unavailable-by-date-short', {
        startDate: startDate ? dayjs(startDate).format(datetimeFormat) : fallbackEmpty(startDate),
        endDate: endDate ? dayjs(endDate).format(datetimeFormat) : fallbackEmpty(endDate),
      })}
    </Badge>
  );
};
const CardsAvailability = () => {
  const { data: deckShopItem } = useDeckShopItem();
  const saleStatus = useShopItemByDateStatus({
    startDate: deckShopItem?.availability_start_date ?? null,
    endDate: deckShopItem?.availability_end_date ?? null,
  });
  const [showTimer, setShowTimer] = useState(true);

  const onComplete = useChangeDeckShopItem((_) => ({
    availability_start_date: null,
  }));
  const onCompleteCompound = () => {
    setShowTimer(false);
    onComplete();
  };

  if (deckShopItem) {
    const display = showTimer && saleStatus === 'soon' && !!deckShopItem?.availability_start_date;

    if (display) {
      return (
        <div className="relative mt-8 w-full">
          <CardReel className="opacity-40" />

          <div className="absolute top-1/2 left-1/2 z-[3000] flex -translate-x-1/2 -translate-y-1/2 flex-col gap-2 md:gap-4">
            <ReText className="w-fit self-center" align="center" size="md">
              Доступно через:
            </ReText>
            <TextTimer
              onComplete={onCompleteCompound}
              className="mx-auto self-center"
              targetDate={deckShopItem.availability_start_date}
            />
            <DeckAvailabilityPast className="mt-2 self-center text-center" />
          </div>
        </div>
      );
    }
    return <CardReel className="mt-8" />;
  }
  return null;
};
const useDroppedCardTitle = () => {
  const t = useTranslations('deck-open');

  return useCallback(
    (card: HeroCardSchema) => {
      if (card.character) {
        return t('you-got-card', { name: card.character.name });
      }

      return t('you-got-collectible-card');
    },
    [t]
  );
};

const DeckDroppedCardModal = () => {
  const { droppedCards, setDroppedCards, deckHandlers } = useDeckStore();
  const droppedCard = droppedCards?.[0];

  const close = () => {
    setDroppedCards(null);
    deckHandlers.reset();
  };

  useEffect(() => {
    if (!droppedCard) return;

    confetti();
  }, [droppedCard]);

  const getDroppedCardTitle = useDroppedCardTitle();

  if (!droppedCard) return null;

  return (
    <HeroCardPreviewModal
      card={droppedCard}
      open={!!droppedCard}
      onOpenChange={(v: boolean) => !v && close()}
      overrides={{
        title: getDroppedCardTitle(droppedCard),
        cardBackground: (
          <img
            src={UrlFormatter.media('public/modal/card-drop-bg.png')}
            className="absolute bottom-[10px] left-1/2 h-[220px] min-w-[450px] -translate-x-1/2 select-none"
            draggable={false}
            alt="modal-bg"
          />
        ),
      }}
      contentProps={{ style: { animationDuration: '1s' } }}
    />
  );
};

const DeckDroppedCardChoiceModal = () => {
  const { deckHandlers, currentDeck, setDroppedCards, setCurrentDeck } = useDeckStore();
  const t = useTranslations();
  const deckId = useParams<{ id: string }>().id;
  const { refetch: refetchDecks } = useAvailableDecks();
  const { refetch: refetchDeck } = useDeckById({ variables: { params: { deckId } } });

  const { mutateAsync: openDeck, isPending: isDeckOpenPending } = useMutation({
    ...v2InventoryDecksChooseCreateMutation({ client }),
    onSuccess: async () => {
      await Promise.all([refetchDecks(), refetchDeck()]);
    },
  });

  const [isButtonLocked, setIsButtonLocked] = useState(false);

  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleChoose = async () => {
    if (selectedCardIndex == null) return;

    const selectedCard = currentDeck!.cards[selectedCardIndex]!;

    setIsButtonLocked(true);

    try {
      await openDeck({
        path: {
          deck_id: currentDeck!.id,
        },
        body: {
          card_id: selectedCard.id,
        },
      });

      setDroppedCards([selectedCard]);
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
      deckHandlers.reset();
    }

    setIsButtonLocked(false);
    setCurrentDeck(null);
  };
  const onSelectCard = (index: number) => {
    if (selectedCardIndex === index) {
      setIsPreviewOpen(true);
    } else {
      setSelectedCardIndex(index);
    }
  };

  if (!currentDeck) return null;

  return (
    <Dialog open={!!currentDeck}>
      <DialogContent
        className="!mt-[100px] flex flex-col items-center sm:max-w-lg md:mt-0"
        withClose={false}
      >
        <DialogTitle className="sr-only">{t('deck-open.choose-one-card')}</DialogTitle>
        <img
          src={UrlFormatter.media('public/modal/card-drop-choice-bg.webp')}
          alt="card drop choice"
          className="mx-auto -mt-[250px]"
        />
        <ReText component="h3" align="center" weight="semibold" size="lg">
          {t('deck-open.choose-one-card')}
        </ReText>
        <ReText align="center" weight="medium" size="sm" color="muted-foreground" className="mb-3">
          {t('deck-open.choose-one-of-three-cards')}
        </ReText>
        <div className="grid w-full grid-cols-3 gap-2">
          {currentDeck.cards.map((card, index) => (
            <HeroCard
              key={index}
              active={index === selectedCardIndex}
              className={cn(
                'transition-transform duration-100',
                index === selectedCardIndex && '-translate-y-3 shadow-sm'
              )}
              card={card}
              onClick={() => onSelectCard(index)}
            />
          ))}
        </div>
        {selectedCardIndex !== null ? (
          <HeroCardPreviewModal
            card={currentDeck.cards[selectedCardIndex]}
            open={isPreviewOpen}
            isSingleCard
            onOpenChange={setIsPreviewOpen}
          />
        ) : null}
        <Button
          className="mt-5 flex-[1_0_auto]"
          disabled={selectedCardIndex == null || isButtonLocked}
          loading={isDeckOpenPending}
          onClick={handleChoose}
        >
          {t('reusable.actions.get')}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

interface DeckCardsListProps {
  model: DeckSchema;
}

const DeckRollSpeed = ({ className, disabled }: { className: string; disabled?: boolean }) => {
  const { speed, setSpeed, isPending } = useDeckStore();
  const t = useTranslations('deck-open');

  const handleChange = () => {
    if (isPending) return;

    setSpeed((v) =>
      v === RouletteConfigSpeed.MEDIUM ? RouletteConfigSpeed.FAST : RouletteConfigSpeed.MEDIUM
    );
  };

  return (
    <div
      className={cn(
        'flex cursor-pointer items-center justify-between gap-4 text-nowrap',
        className
      )}
      onClick={handleChange}
    >
      {t('fast-open')}
      <Switch checked={speed === RouletteConfigSpeed.FAST} disabled={isPending || disabled} />
    </div>
  );
};

const DeckCardsList = (props: DeckCardsListProps) => {
  const { model } = props;
  const { setCard } = useHeroCardModal();
  const t = useTranslations('deck-open');

  if (!model) return null;

  const cards = model?.cards ?? [];
  const FlatList: FlatListType<typeof cards> = _FlatList;

  const isRandomDeck = model?.type === DeckType.RANDOM;

  return (
    <div className="mt-4 flex flex-col items-center gap-4">
      <ReText size="lg" className="mt-6" weight="semibold">
        {t('pack-items')}
      </ReText>

      <FlatList.Root content={cards} className="w-full">
        <FlatList.Layout className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
          <FlatList.Content>
            {({ item, attributes }) => (
              <HeroCard
                key={item.id}
                withHover={false}
                faceDown={isRandomDeck}
                withBorder={false}
                card={item}
                className={cn({
                  'hover:bg-secondary cursor-pointer hover:shadow-md': !isRandomDeck,
                })}
                {...attributes}
                onClick={() => {
                  !isRandomDeck && setCard(item);
                }}
              />
            )}
          </FlatList.Content>
          <FlatList.Empty className="col-span-full" />
        </FlatList.Layout>
      </FlatList.Root>
    </div>
  );
};

const BuyButtonAction = memo(
  ({
    count = 1,
    deck: deckShopItem,
    disabled,
  }: {
    disabled?: boolean;
    count?: number;
    deck: DeckSchema;
  }) => {
    const t = useTranslations();
    const session = useSession()!;
    const { mutateAsync: buyDeck, isPending } = useBuyDeck({
      invalidate: ({ queryKey }) =>
        queryKey?.[0]?._id === v2InventoryDecksRetrieveInfiniteQueryKey({})[0]._id ||
        queryKey[0] === ShopQueryKeys.Deck.byId({})[0],
    });
    const { open } = useExchangeModal();
    const getConfirmation = useGetConfirmation();
    const checkLogged = useLoggedCheck();

    const handleBuyDeck = async (currency: 'tickets' | 'coins', count: number = 1) => {
      try {
        await buyDeck({ shopItemId: deckShopItem.id, currency, count });
      } catch (e) {
        logger.error(e);
        await resolveErrorAsync(e);
      }
    };

    const coinsPrice = (deckShopItem?.cost || 0) * count;
    const ticketPrice = (deckShopItem?.cost_tickets || 0) * count;
    const shouldDisabled = isPending || disabled;
    const hasCoins = session?.coins >= coinsPrice;
    const hasTickets = session?.ticket_balance >= ticketPrice;

    const handleCoinsClick = checkLogged(async (count: number) => {
      if (!hasCoins) {
        open();
        return;
      }

      // const confirmed = await getConfirmation({
      //   title: t('deck-open.buy-pack'),
      //   closeVariant: 'default',
      //   description: t('deck-open.buy-pack-description', { coinsPrice, currency: 'coins' }),
      // });
      //
      // if (!confirmed) return;

      handleBuyDeck('coins', count);
    });

    const handleTicketsClick = checkLogged(async () => {
      if (!hasTickets) return;

      const confirmed = await getConfirmation({
        title: t('deck-open.buy-pack'),
        confirmVariant: 'default',
        description: t('deck-open.buy-pack-description', {
          coinsPrice: ticketPrice,
          currency: 'tickets',
        }),
      });

      if (!confirmed) return;

      handleBuyDeck('tickets');
    });

    return (
      <div className="flex flex-row items-center gap-3">
        <ReText size="sm">{t('reusable.actions.buy')}:</ReText>
        <div className="flex items-center gap-3">
          <ButtonGroup>
            <Button
              size="sm"
              disabled={shouldDisabled}
              onClick={() => handleCoinsClick(1)}
              className="pr-1"
              endIcon={<CoinIcon className="size-4" />}
            >
              {coinsPrice} (x1)
            </Button>
            <Button
              size="sm"
              color="primary"
              disabled={shouldDisabled}
              onClick={() => handleCoinsClick(10)}
              className="ml-[1px] pl-2"
              endIcon={<CoinIcon className="size-4" />}
            >
              {coinsPrice * 10} (x10)
            </Button>
          </ButtonGroup>
          {hasTickets && !!ticketPrice ? (
            <Button
              size="sm"
              disabled={shouldDisabled}
              onClick={handleTicketsClick}
              endIcon={<TicketIcon />}
            >
              {ticketPrice}
            </Button>
          ) : null}
        </div>
      </div>
    );
  }
);
BuyButtonAction.displayName = 'BuyButtonAction';
const DeckPastDateBadge = ({ deck, className }: { deck: DeckSchema; className?: string }) => {
  const salesStatus = useShopItemByDateStatus({
    startDate: deck.availability_start_date,
    endDate: deck.availability_end_date,
  });
  const status = getItemStatus(deck);
  const locale = useLocale();
  const tz = useTimeZone();
  const show =
    !!deck.availability_end_date &&
    salesStatus === 'infinite-or-past' &&
    status === 'unavailable-by-date' &&
    deck.availability_end_date;
  if (!show) return null;
  const finalStartDate = dayjs(deck.availability_start_date)
    .locale(locale)
    .tz(tz)
    .format('DD.MM.YYYY');
  return (
    <ReText weight="medium" className={cn(className, '')} size="sm" color="muted-foreground">
      Была в продажах до {finalStartDate}
    </ReText>
  );
};
const BuyButton = (props: Omit<ComponentProps<typeof BuyButtonAction>, 'deck'>) => {
  const { data: deckShopItem } = useDeckShopItem();
  if (!deckShopItem) return null;
  return <BuyButtonAction deck={deckShopItem} {...props} />;
};
BuyButton.displayName = 'BuyButton';

const DeckControls = memo(() => {
  const { start } = useDeckStore((v) => v.deckHandlers);
  const isPending = useDeckStore((v) => v.isPending);
  const t = useTranslations();
  const { data: decks, isFetching, count } = useAvailableDecks();
  const { data: deckShopItem } = useDeckShopItem();
  const deckToOpen = decks?.[0];
  const status = getItemStatus(deckShopItem!);
  const unavailable2Buy =
    status === 'unavailable-by-date' ||
    status === 'unavailable-at-all' ||
    (status === 'out-of-stock' && !count);

  const disabledBuy = isPending || unavailable2Buy;
  const { mutateAsync: openDeck, isPending: isDeckOpenPending } = useMutation(
    v2InventoryDecksOpenCreateMutation({ client })
  );
  const disabledOpen = !deckToOpen || isDeckOpenPending || isPending || isFetching || !count;

  const handleStart = async () => {
    const drop = await openDeck({
      path: {
        deck_id: deckToOpen?.id,
      },
    });

    if (!drop) return;

    start({
      deck: {
        id: deckToOpen.id,
        cards: drop,
      },
    });
  };

  return (
    <div className={cn('relative mt-5 flex flex-col items-center justify-center')}>
      <div className="relative flex h-[80px] w-full items-center justify-center overflow-hidden">
        <span className="mt-5 flex flex-col items-center">
          <Button
            className="relative z-20"
            onClick={handleStart}
            variant="shadow"
            color="primary"
            size="lg"
            disabled={disabledOpen}
          >
            {t('reusable.actions.open')} {count ? `(${count})` : null}
          </Button>
          {deckShopItem && <DeckPastDateBadge className="mt-[5px] h-[17px]" deck={deckShopItem} />}
        </span>

        <Arrow className="absolute top-0 left-[70%] opacity-40 md:left-[70%]" />
        <div className="from-background absolute top-0 left-0 z-10 h-full w-1/2 bg-gradient-to-r to-transparent" />

        <Arrow className="absolute top-0 right-[70%] rotate-180 opacity-40 sm:right-[70%]" />
        <div className="from-background absolute top-0 right-0 z-10 h-full w-1/2 bg-gradient-to-l to-transparent" />
      </div>

      <div className="xs:flex-row relative z-10 mt-5 flex w-full flex-col items-center justify-between gap-2 px-2 lg:absolute lg:mt-0 lg:px-[32px]">
        <div className="flex items-center justify-center rounded-md">
          <Suspense fallback={<div />}>
            <BuyButton disabled={disabledBuy} />
          </Suspense>
        </div>

        <div className="border-border bg-background z-10 flex items-center justify-center rounded-md border">
          <DeckRollSpeed disabled={disabledBuy} className="h-[40px] px-4" />
        </div>
      </div>
    </div>
  );
});

DeckControls.displayName = 'DeckControls';

const DropGuaranteeButton = () => {
  const t = useTranslations('deck-open');
  const params = useParams<{ id: string }>();
  const deckId = params.id;

  // user is authorized, so current_decks_opens != null implied
  const { data: deck } = useDeckById({ variables: { params: { deckId } } });
  const { count } = useAvailableDecks();

  const { currentGuarantee, config } = useMemo(() => {
    const config = [
      {
        rank: 'S',
        total: count,
        goal: deck.guarantors.guarantors.rank_s,
        count: deck.current_decks_opens!.rank_s_opens,
      },
      {
        rank: 'A',
        total: count,
        goal: deck.guarantors.guarantors.rank_a,
        count: deck.current_decks_opens!.rank_a_opens,
      },
    ]
      .filter((it) => it.goal)
      .map((it) => ({ ...it, goal: it.goal, remaining: it.goal - it.count }));

    const currentGuarantee = config.reduce(
      (acc, value) => (acc.remaining > value.remaining ? value : acc),
      { remaining: Infinity, rank: '' }
    );

    return {
      config,
      currentGuarantee,
    };
  }, [deck, count]);

  if (currentGuarantee.remaining === Infinity) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="bg-secondary flex h-8 cursor-pointer items-center justify-center gap-2 rounded-md px-4">
          <ReText size="sm" color="muted-foreground">
            {currentGuarantee.remaining === 1
              ? t.rich('guarantee-button-text-guaranteed', { rank: currentGuarantee.rank })
              : t.rich('guarantee-button-text-remaining', {
                  count: currentGuarantee.remaining,
                  rank: currentGuarantee.rank,
                  accent: (text) => <span className="text-foreground">{text}</span>,
                })}
          </ReText>
          <Button color="secondary" circle size="xs" className="text-muted-foreground">
            <QuestionMarkIcon size={16} />
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="flex flex-col items-center gap-0">
        <DialogTitle className="sr-only">{t('guarantee-title', { name: deck.name })}</DialogTitle>
        <Image
          src="/guarantee-deck-drop-modal-icon.png"
          alt="modal adornment"
          width={618}
          height={570}
          className="-mt-[250px] w-[310px]"
        />
        <ReText size="lg" weight="semibold">
          {t('guarantee-title', { name: deck.name })}
        </ReText>
        {deck.type !== DeckType.RANDOM ? (
          <ReText weight="medium" color="muted-foreground" className="mt-4">
            {t.rich('guarantee-items-count', {
              count: deck.cards.length,
              accent: (text) => <span className="text-foreground">{text}</span>,
            })}
          </ReText>
        ) : null}
        <ReText align="center" size="sm" color="muted-foreground" className="mt-4">
          {t.rich('guarantee-description', {
            accent: (text) => <span className="text-primary">{text}</span>,
          })}
        </ReText>
        <ul className="mt-4 flex flex-wrap justify-center gap-2 px-10">
          {config.map(({ rank, goal }, index) => (
            <li
              key={index}
              className="bg-secondary flex h-8 items-center justify-center rounded-md px-4"
            >
              <ReText size="sm" color="muted-foreground">
                {t.rich('guarantee-item-label', {
                  rank,
                  count: goal,
                  accent: (text) => <span className="text-foreground">{text}</span>,
                })}
              </ReText>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
};

export const DeckOpenPage = () => {
  const params = useParams<{ id: string }>();
  const deckId = params.id;
  const { data: deck } = useDeckById({ variables: { params: { deckId } } });

  const deckContextInit = {
    possibleCards: deck.cards,
    isRandomMode: deck.type === DeckType.RANDOM,
  };

  return (
    <DeckContextProvider value={deckContextInit}>
      <Container slim className="mt-8 flex px-3">
        <div className="w-full flex-col items-center">
          <div className="relative flex flex-[1] flex-col items-center justify-center gap-3">
            <ReText className="" component="h2" align="center" size="xl" weight="bold">
              {deck.name}
            </ReText>
            {deck.current_decks_opens ? <DropGuaranteeButton /> : null}
          </div>
          <CardsAvailability />
          {/*<CardReel className="mt-8"/>*/}
          <DeckControls />
          <DeckCardsList model={deck} />
          <DeckDroppedCardModal />
          <DeckDroppedCardChoiceModal />
        </div>
      </Container>
    </DeckContextProvider>
  );
};
