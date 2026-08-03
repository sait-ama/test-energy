'use client';

import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import Image from 'next/image';

import ChevronDownIcon from '@re/ui-kit/icons/chevron-down';
import MinusIcon from '@re/ui-kit/icons/minus';
import PlusIcon from '@re/ui-kit/icons/plus';
import StarFavoriteIcon from '@re/ui-kit/icons/star-favorite';
import { Button } from '@re/ui-kit/ui/button';
import { Dialog, DialogContent } from '@re/ui-kit/ui/dialog';
import { Label } from '@re/ui-kit/ui/label';
import { Switch } from '@re/ui-kit/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@re/ui-kit/ui/tabs';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';
import { useMutation } from '@tanstack/react-query';
import { domAnimation, LazyMotion, m as motion } from 'motion/react';

import { useMergeCards } from '~entities/inventory/model/mutations';
import { useHeroCardsByUserInfinite } from '~entities/inventory/model/queries';
import { HeroCard } from '~entities/inventory/ui/hero-card';
import { HeroCardPreviewModal } from '~entities/inventory/ui/hero-card-preview';
import type {
  HeroCardItemSchema,
  HeroCardRank,
  HeroCardSchema,
} from '~shared/api/models/inventory';
import { useLocalStorageState } from '~shared/hooks/use-local-storage-state';
import { useScrollOffsetTrigger } from '~shared/hooks/use-scroll-offset-trigger';
import { useBottomActions } from '~shared/lib/bottom-bar/use-bottom-actions';
import { transformErrorDetail } from '~shared/lib/form/error-handling-base';
import { breakpoints } from '~shared/lib/media/const';
import { useSession } from '~shared/lib/session/use-session';
import { isApiError } from '~shared/types/api.type-guard';
import { Container } from '~shared/ui/container';
import { FlatList as _FlatList, type FlatListType } from '~shared/ui/flat-list-v2';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { adjustArrayLength } from '~shared/utils/adjust-array-length';
import { UrlFormatter } from '~shared/utils/url-formatter';

import { HeroCardUpgradeHistory } from './hero-card-upgrade-history';

const MERGE_MAX_CARDS_EXCLUSIVE = 3;
const MERGE_MAX_CARDS_RANDOM = 3;
const MERGE_MAX_CARDS_DEFAULT = 2;

interface SelectionItemSchema {
  count: number;
  item: HeroCardItemSchema;
}

const flattenSelectionItem = (selectionItem: SelectionItemSchema): HeroCardItemSchema[] =>
  Array.from({ length: selectionItem.count }, () => selectionItem.item);
const flattenSelection = (selection: SelectionItemSchema[]): HeroCardItemSchema[] =>
  selection.reduce<HeroCardItemSchema[]>(
    (acc, value) => [...acc, ...flattenSelectionItem(value)],
    []
  );

interface HeroCardUpgradeFormSchema {
  selectedCards: SelectionItemSchema[];
  cardsRank: HeroCardRank | undefined;
}

interface HeroCardUpgradeProps {
  onSuccess?: () => void;
}

const getDroppedCardTitle = (card: HeroCardSchema) => {
  if (card.character) {
    return `Вы получили карточку "${card.character.name}"`;
  }

  return 'Вы получили коллекционную карточку';
};

// кастылим кастылим

interface HeroCardDropAnimationModalProps {
  cards: HeroCardItemSchema[];
  onAnimationComplete: () => void;
  isMobile?: boolean;
  open?: boolean;
}

const HeroCardDropAnimationModal = (props: HeroCardDropAnimationModalProps) => {
  const { cards, open, onAnimationComplete, isMobile } = props;

  const baseClassName = 'absolute left-[50%] top-[50%] -translate-y-1/2 -translate-x-1/2';

  const outerInitial = {
    scale: 1,
    opacity: 1,
    rotate: 0,
  };

  const outerFinal = {
    scale: 0,
    opacity: 0,
    rotate: 720,
  };

  const innerInitial = {
    scale: 1,
    rotate: 0,
  };

  const innerFinal = {
    scale: 0,
    rotate: 1440,
    y: 0,
    x: 0,
  };

  const ease = (v: number) => v ** 3;

  const transition = {
    duration: 3,
    ease,
  };

  const isTwoCards = cards.length === 2;

  const translateConfig = [
    { y: isMobile ? -150 : -280, x: 0 },
    { y: isMobile ? 150 : 280, x: isTwoCards ? 0 : isMobile ? -120 : -240 },
    { y: isMobile ? 150 : 280, x: isTwoCards ? 0 : isMobile ? 120 : 240 },
  ];

  const delayConfig = [0.8, 1.2, 1.6];

  return (
    <Dialog open={open}>
      <DialogContent
        className="select-none sm:max-w-[900px]"
        style={{ background: 'none', border: 'none', animationDuration: '1s' }}
        withClose={false}
      >
        <LazyMotion features={domAnimation}>
          <div className="flex aspect-square flex-col items-center justify-center gap-5">
            <div className="relative">
              <Image
                width={240}
                height={240}
                src={UrlFormatter.media('public/cards-merge/black-hole.png')}
                alt="black-hole"
                className="duration-\\[10s\\] animate-spin"
                style={{ animationDuration: '10s' }}
              />
              {cards.map((cardItem, i) => {
                const translate = translateConfig[i];
                const delay = delayConfig[i];

                const isLast = i === cards.length - 1;

                return (
                  <motion.div
                    key={i}
                    className={baseClassName}
                    animate={outerFinal}
                    initial={outerInitial}
                    // style={{
                    //   ...cardContainer /* , filter: 'drop-shadow(0 0 2rem hsl(var(--r-primary)))' */,
                    // }}
                    transition={{ ...transition, delay }}
                  >
                    <HeroCard
                      className="w-[100px] sm:w-[150px]"
                      card={cardItem.card}
                      component={motion.div}
                      initial={{ ...innerInitial, ...translate }}
                      animate={innerFinal}
                      transition={{ ...transition, delay }}
                      onAnimationComplete={isLast ? onAnimationComplete : undefined}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </LazyMotion>
      </DialogContent>
    </Dialog>
  );
};

interface HeroCardDropViewProps {
  cards: HeroCardItemSchema[];
  droppedCard: HeroCardSchema;
  onAnimate: (isAnimated: boolean) => void;
  onClose: () => void;
  disableAnimation?: boolean;
}

const HeroCardDropView = ({
  disableAnimation = false,
  cards,
  droppedCard,
  onClose,
  onAnimate,
}: HeroCardDropViewProps) => {
  const [hasAnimationEnded, setHasAnimationEnded] = useState(disableAnimation);

  const [isMobile, setIsMobile] = useState<boolean>();

  useEffect(() => {
    setIsMobile(matchMedia(`(max-width: ${breakpoints.sm}px)`).matches);
  }, []);

  useEffect(() => {
    if (typeof isMobile !== 'undefined' && !disableAnimation) {
      onAnimate(true);
    }
  }, [disableAnimation]);

  if (typeof isMobile === 'undefined') return null;

  return hasAnimationEnded ? (
    <HeroCardPreviewModal
      card={droppedCard}
      open={!!droppedCard}
      onOpenChange={(v) => !v && onClose()}
      overrides={{
        title: (
          <ReText weight="semibold" size="lg" align="center">
            {getDroppedCardTitle(droppedCard)}
          </ReText>
        ),
      }}
      contentProps={{ style: { animationDuration: '1s' } }}
    />
  ) : (
    <HeroCardDropAnimationModal
      isMobile={isMobile}
      cards={cards}
      open={!!droppedCard}
      onAnimationComplete={() => {
        onAnimate(false);
        setHasAnimationEnded(true);
      }}
    />
  );
};

const UPGRADE_CARD_ACTION_NAME = 'hero_card_upgrade';

export const HeroCardUpgrade: FC<HeroCardUpgradeProps> = (props) => {
  'use no memo';

  const { onSuccess } = props;
  const { setValue, getValues, watch, reset } = useForm<HeroCardUpgradeFormSchema>({
    defaultValues: {
      selectedCards: [],
      cardsRank: undefined,
    },
  });
  const isFirstRun = useRef(true);

  const { register, unregister } = useBottomActions();
  const { selectedCards, cardsRank } = watch();

  const [tab, setTab] = useState<string>('common');
  const [isAnimatingDrop, setIsAnimatingDrop] = useState<boolean>(false);
  const [disableAnimation, setDisableAnimation] = useLocalStorageState<boolean>(false);
  const maxMergeCards =
    tab === 'common'
      ? MERGE_MAX_CARDS_DEFAULT
      : tab === 'exclusive'
        ? MERGE_MAX_CARDS_EXCLUSIVE
        : MERGE_MAX_CARDS_RANDOM;

  const [droppedCard, setDroppedCard] = useState<HeroCardSchema | null>(null);

  const currentUser = useSession()!;

  const {
    data: cardsData,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useHeroCardsByUserInfinite({
    variables: {
      params: {
        userId: currentUser.id,
      },
      query: {
        count: 25,
        ordering: 'rank',
        // TODO - добавить фильтрацию
        card__rank: cardsRank,
        exclude_card__rank__in: ['rank_a', 'rank_re', 'rank_s'],
      },
    },
  });

  const inventoryCardsFlat = useMemo(() => {
    return cardsData?.pages.flatMap((v) => v.results) || [];
  }, [cardsData]);

  const inventoryCards = useMemo(
    () =>
      inventoryCardsFlat
        // .filter((item) => item.stack_count > 1)
        .filter((item) => (tab === 'default' ? item.card.rank !== 'rank_re' : true)),
    [inventoryCardsFlat, tab]
  );

  useEffect(() => {
    if (!inventoryCards.length && hasNextPage) {
      fetchNextPage();
    }
  }, [inventoryCards, hasNextPage]);

  const selecetedCardsAdjusted = useMemo(() => {
    const flatData = flattenSelection(selectedCards);

    return adjustArrayLength<(HeroCardItemSchema | null)[]>(flatData, {
      length: maxMergeCards,
    });
  }, [selectedCards, maxMergeCards]);

  const selectedCardsMap = useMemo(
    () => new Map(selectedCards.map((v) => [v.item.id, v])),
    [selectedCards]
  );

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    setValue('selectedCards', []);
  }, [tab]);

  const canUpgrade = selectedCards.reduce((acc, it) => acc + it.count, 0) >= maxMergeCards;

  const { mutateAsync: mergeCards } = useMergeCards();

  const { mutate: handleUpgrade, isPending: isUpgrading } = useMutation({
    mutationKey: ['heroCardUpgrade'],
    mutationFn: async () => {
      const cards = flattenSelection(getValues('selectedCards')).slice(0, maxMergeCards);
      return mergeCards({
        userId: currentUser.id,
        cards: cards.flatMap((cardItem) => Array(cardItem.count).fill(cardItem.card.id)),
        is_random: tab === 'random',
        type: tab === 'common' ? 1 : tab === 'exclusive' ? 2 : 3,
      });
    },
    onError: (error, variables, context) => {
      if (error && isApiError(error)) {
        const message = transformErrorDetail(error.data);

        importToastAsync().then((m) =>
          m.error(`Произошла ошибка${message ? `.\n\r ${message}` : ''}`)
        );
      } else {
        importToastAsync().then((m) => m.error('Произошла ошибка'));
      }
    },
    onSuccess: (data) => {
      setDroppedCard(data);
    },
  });

  const onUpgradeAnimationEnded = () => {
    reset();
    onSuccess?.();
    setDroppedCard(null);
  };

  const handleAdd = useCallback(
    (cardItem: HeroCardItemSchema) => {
      const selectionItems = [...getValues('selectedCards')];

      const index = selectionItems.findIndex(
        (selectionItem) => selectionItem.item.id === cardItem.id
      );
      const selectionItem = index === -1 ? undefined : selectionItems[index];
      const selectionItemCount = selectionItem?.count ?? 0;

      const limitExceeded =
        flattenSelection(selectionItems).length >= maxMergeCards ||
        selectionItemCount >= cardItem.stack_count;

      if (limitExceeded) return;

      if (!selectionItem) {
        selectionItems.push({ count: 1, item: cardItem });
      } else {
        selectionItems[index] = { ...selectionItem, count: selectionItemCount + 1 };
      }

      setValue('selectedCards', selectionItems);
    },
    [setValue, tab]
  );

  const handleRemove = useCallback(
    (cardItem: HeroCardItemSchema) => {
      const selectionItems = [...getValues('selectedCards')];

      const index = selectionItems.findIndex(
        (selectionItem) => selectionItem.item.id === cardItem.id
      );
      const selectionItem = index === -1 ? undefined : selectionItems[index];
      const selectionItemCount = selectionItem?.count ?? 0;

      if (!selectionItem) return;

      if (selectionItemCount <= 1) {
        selectionItems.splice(index, 1);
      } else {
        selectionItems[index] = { ...selectionItem, count: selectionItemCount - 1 };
      }

      setValue('selectedCards', selectionItems);
    },
    [setValue, tab]
  );

  const FlatList: FlatListType<typeof inventoryCards> = _FlatList;

  useEffect(() => {
    if ((disableAnimation || !isAnimatingDrop) && !droppedCard) {
      register({
        index: -1,
        key: UPGRADE_CARD_ACTION_NAME,
        node: (
          <div className="bg-secondary mx-auto flex max-w-[420px] items-center justify-between gap-2 overflow-hidden rounded-md px-3 py-2.5 opacity-100">
            <ReText color="muted-foreground" size="sm">
              {tab === 'common'
                ? 'Вы получите карту рангом выше из того же тайтла'
                : tab === 'exclusive'
                  ? 'Вы получите карту рангом выше одного из тайтлов, карты которых апгрейдите'
                  : 'Вы получите карту рангом выше из любого тайтла'}
            </ReText>
            <Button
              onClick={handleUpgrade}
              disabled={!canUpgrade || isUpgrading}
              variant="secondary"
              className="flex items-center justify-between"
            >
              <span>Апгрейд</span>
              {isUpgrading ? <span className="ml-1">...</span> : null}
            </Button>
          </div>
        ),
      });
      return () => unregister(UPGRADE_CARD_ACTION_NAME);
    }
  }, [tab, isAnimatingDrop, canUpgrade, droppedCard, isUpgrading, disableAnimation]);

  const renderCardItem = useCallback(
    ({ item }) => {
      const selectionCard = selectedCardsMap.get(item.id);
      const selectionCardCount = selectionCard?.count ?? 0;

      const canSelect =
        tab !== 'common' ||
        (item.card.title &&
          !selectedCards.find(({ item: selectedItem }) => {
            return (
              selectedItem.card.title?.id !== item.card.title?.id ||
              selectedItem.card.rank !== item.card.rank
            );
          }));

      const handleRemoveClick = () => {
        handleRemove(item);
      };

      const handleAddClick = async () => {
        const toast = await importToastAsync();
        if (item.is_favorite) {
          toast.error('Вы не можете обьединять избранные карточки');
          return;
        }
        handleAdd(item);
      };

      const canAdd = selectionCardCount < item.stack_count && canSelect;

      const onCardClick = () => {
        if (canAdd) {
          handleAddClick();
          return;
        }
        if (selectionCard) {
          handleRemoveClick();
        }
      };

      return (
        <div
          key={item.id}
          className={cn(
            'border-border relative rounded-xs border',
            !canSelect && 'opacity-30',
            !!selectionCard && 'bg-accent border-primary/50'
          )}
        >
          <HeroCard className="h-auto" key={item.id} card={item.card} onClick={onCardClick} />
          {item.is_favorite && (
            <div className="bg-accent/50 absolute top-2 left-2 rounded-xs p-2">
              <StarFavoriteIcon />
            </div>
          )}
          {/*<div className="bg-accent/50 absolute top-2 right-2 rounded-xs p-2 py-1">*/}
          {/*  <ReText weight="bold">{item.card.rank}</ReText>*/}
          {/*</div>*/}
          <div className="flex items-center justify-between gap-2 rounded-md p-[6px]">
            <Button
              disabled={!selectionCard}
              size="sm"
              variant="flat"
              color="danger"
              className="rounded-xs"
              circle
              onClick={handleRemoveClick}
            >
              <MinusIcon />
            </Button>
            <ReText
              size="sm"
              weight="medium"
              component="span"
            >{`${selectionCardCount}/${item.stack_count}`}</ReText>
            <Button
              disabled={!canAdd}
              size="sm"
              variant="flat"
              color="primary"
              className="rounded-xs"
              circle
              onClick={handleAddClick}
            >
              <PlusIcon />
            </Button>
          </div>
        </div>
      );
    },
    [selectedCardsMap, selectedCards]
  );

  const renderSelectedCards = useCallback(() => {
    return selecetedCardsAdjusted.map((cardItem, i) => (
      <div
        className="shrink-0 grow-0 basis-1/4 sm:basis-1/4 md:basis-1/12 2xl:basis-1/12"
        key={`e${i}`}
      >
        <HeroCard
          card={cardItem?.card}
          withBorder
          onClick={cardItem && (() => handleRemove(cardItem))}
        />
      </div>
    ));
  }, [selecetedCardsAdjusted]);

  return (
    <div className="my-4 flex w-full flex-col gap-2">
      <div className="space-y-3">
        <div className="grid grid-cols-2 max-md:grid-cols-1 md:grid-cols-3">
          <Tabs
            value={tab}
            onValueChange={(v) => {
              setTab(v);

              const maxMergeCards =
                v === 'common'
                  ? MERGE_MAX_CARDS_DEFAULT
                  : v === 'exclusive'
                    ? MERGE_MAX_CARDS_EXCLUSIVE
                    : MERGE_MAX_CARDS_RANDOM;
              setValue('selectedCards', selectedCards.slice(0, maxMergeCards));
            }}
            className="flex justify-center self-center justify-self-start md:order-none md:col-start-2 md:justify-self-center"
          >
            <TabsList>
              <TabsTrigger value="common">Обычные</TabsTrigger>
              <TabsTrigger value="exclusive">Эксклюзивные</TabsTrigger>
              <TabsTrigger value="random">Рандомные</TabsTrigger>
            </TabsList>
          </Tabs>

          <HeroCardUpgradeHistory className="self-center justify-self-end max-md:mt-4 max-md:justify-self-center md:col-start-3 md:ml-auto" />
        </div>

        <div className="mb-2">
          <div className="mb-2 flex flex-wrap justify-center gap-2">{renderSelectedCards()}</div>
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="default"
              color="secondary"
              size="sm"
              disabled={!selectedCards.length}
              onClick={() => setValue('selectedCards', [])}
            >
              Очистить
            </Button>
            <div className="flex items-center gap-2">
              <Switch
                id="disable-animation"
                checked={disableAnimation}
                onCheckedChange={(v) => setDisableAnimation(v)}
              />
              <Label htmlFor="disable-animation">Отключить анимацию</Label>
            </div>
          </div>
        </div>
      </div>
      <StickyHeader>
        {({ expanded, setExpanded }) => (
          <>
            <div className="flex w-full items-center">
              <div className="text-sm">
                Выбрано: {selectedCards.reduce((acc, it) => acc + it.count, 0)} из {maxMergeCards}{' '}
                карт
              </div>
              <Button
                variant="default"
                color="secondary"
                size="sm"
                circle
                className={cn('ml-2', expanded && 'rotate-180')}
                onClick={() => setExpanded(!expanded)}
              >
                <ChevronDownIcon />
              </Button>
              <Button
                variant="default"
                color="secondary"
                size="sm"
                className="ml-auto"
                disabled={!selectedCards.length}
                onClick={() => setValue('selectedCards', [])}
              >
                Очистить
              </Button>
            </div>
            {expanded && <div className="mt-2 flex flex-wrap gap-2">{renderSelectedCards()}</div>}
          </>
        )}
      </StickyHeader>
      <FlatList.Root
        content={inventoryCards}
        isLoading={isLoading}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isEmpty={!isLoading && !inventoryCards.length && !hasNextPage}
      >
        <FlatList.Container className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
          <FlatList.Content>{renderCardItem}</FlatList.Content>
          <FlatList.EdgeTrigger
            onTrigger={fetchNextPage}
            canTrigger={!isFetchingNextPage && hasNextPage}
          />
          <FlatList.Loading count={20}>
            {({ key }) => <HeroCard loading key={key} />}
          </FlatList.Loading>
          <FlatList.Empty text="У вас нет карточек" emoji="🎴" />
        </FlatList.Container>
      </FlatList.Root>
      {droppedCard ? (
        <HeroCardDropView
          onClose={onUpgradeAnimationEnded}
          droppedCard={droppedCard}
          cards={selecetedCardsAdjusted}
          onAnimate={setIsAnimatingDrop}
          disableAnimation={disableAnimation}
        />
      ) : null}
    </div>
  );
};

function StickyHeader({
  children,
}: {
  children: ({
    expanded,
    setExpanded,
  }: {
    expanded: boolean;
    setExpanded: (expanded: boolean) => void;
  }) => React.ReactNode;
}) {
  const isScrolled = useScrollOffsetTrigger(300);
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className={cn(
        'bg-background fixed top-0 left-0 z-10 w-full -translate-y-full opacity-0 shadow-sm transition-all duration-200 md:top-[var(--header-height)]',
        isScrolled && 'flex translate-y-0 flex-col opacity-100'
      )}
    >
      <Container slim className="flex flex-col p-4">
        {children({ expanded, setExpanded })}
      </Container>
    </div>
  );
}
