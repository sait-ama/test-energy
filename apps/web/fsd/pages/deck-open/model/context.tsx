import type { Dispatch, SetStateAction } from 'react';
import { useMemo, useState } from 'react';

import { type MotionValue, useAnimate, useMotionValue, useTransform } from 'motion/react';

import { createContextSelector } from '@re/core/utils/create-context-selector';

import type { HeroCardSchema } from '~shared/api/models/inventory';
import { useLocalStorageState } from '~shared/hooks/use-local-storage-state';
import { useMediaQuery } from '~shared/hooks/use-media-query';
import { easeInOutSine } from '~shared/utils/easings';
import { randInt } from '~shared/utils/rand-int';

export const enum RouletteConfigSpeed {
  MEDIUM = 'medium',
  FAST = 'fast',
}

class RouletteConfig {
  itemCount = 51;
  speed: RouletteConfigSpeed = RouletteConfigSpeed.MEDIUM;
  duration = 0;
  dropPosition = 0;
  itemSize: number;
  itemOffset: number;

  constructor() {
    this.setSpeed(RouletteConfigSpeed.MEDIUM);
    this.itemSize = 0;
    this.itemOffset = 0;
    this.itemCount = 21;
  }

  public setSpeed(speed: RouletteConfigSpeed) {
    switch (speed) {
      case RouletteConfigSpeed.MEDIUM:
        this.duration = 6;
        this.speed = RouletteConfigSpeed.MEDIUM;
        break;
      case RouletteConfigSpeed.FAST:
        this.duration = 1;
        this.speed = RouletteConfigSpeed.FAST;
        break;
    }
  }

  private getItemOffset = () => {
    let rollsMultiplier;

    switch (this.speed) {
      case RouletteConfigSpeed.MEDIUM:
        rollsMultiplier = 4;
        break;
      case RouletteConfigSpeed.FAST:
      default:
        rollsMultiplier = 1;
    }
    return this.itemCount * rollsMultiplier + Math.ceil(this.itemCount / 2) + this.dropPosition + 1;
  };

  public recalculateSizes({ itemSize }: { itemSize: number }) {
    this.itemSize = itemSize;
    this.itemOffset = this.getItemOffset();
  }
}

export interface UseRouletteHandlersOptions {
  possibleCards: HeroCardSchema[];
  onStart: () => void;
  onDrop: (deck: CurrentDeck) => void;
  speed: RouletteConfigSpeed;
}

export interface RouletteHandlers {
  cardsList: HeroCardSchema[];
  offset: MotionValue<number>;
  start: (args: { deck: CurrentDeck }) => void;
  reset: () => void;
}

const useRouletteHandlers = (options: UseRouletteHandlersOptions): RouletteHandlers => {
  const { possibleCards, onStart, onDrop, speed } = options;

  const config = useMemo(() => new RouletteConfig(), []);

  const generateRandomCards = () => {
    const cards = Array.from(
      { length: config.itemCount },
      () => possibleCards[randInt(0, possibleCards.length)]!
    );
    //todo: ? фейковые хай ранги
    // const highRank = possibleCards.find((value) => value.rank === HERO_CARD_RANK.B);

    // cards.splice(DROP_POSITION - 1, 1, highRank);
    // cards.splice(DROP_POSITION + 3, 1, highRank);

    return cards;
  };

  const [cardsList, setCardsList] = useState(generateRandomCards);

  const insertRandomCards = () => setCardsList(generateRandomCards());

  const insertDrop = ({ drop }: { drop: HeroCardSchema[] }) =>
    setCardsList((prev) => {
      const newCards = [...prev];
      newCards.splice(config.dropPosition, 3, ...drop);
      return newCards;
    });

  const [, animate] = useAnimate();

  const offset = useMotionValue(0);
  const resolvedOffset = useTransform(() => -(offset.get() % (cardsList.length * config.itemSize)));

  const handleCancel = async () => {
    insertRandomCards();
    await animate(offset, 0, { duration: 0.0000001 });
  };

  const handleRoll = async ({ deck }: { deck: CurrentDeck }) => {
    insertDrop({ drop: deck.cards });
    // const ease = cubicBezier(0.395, 0.020, 0, 1);
    // const ease = cubicBezier(0.5, 0.25, 0, 1)
    queueMicrotask(() =>
      animate(offset, offset.get() + config.itemOffset * config.itemSize, {
        duration: config.duration,
        onComplete: () => onDrop(deck),
        ease: easeInOutSine,
      })
    );
  };

  const isDesktop = useMediaQuery('(min-width: 768px)');

  const start = async ({ deck }: { deck: CurrentDeck }) => {
    onStart();
    const itemSize = isDesktop ? 158 : 108;
    config.setSpeed(speed);
    config.recalculateSizes({ itemSize });
    await handleRoll({ deck });
  };

  const reset = async () => {
    await handleCancel();
  };

  return {
    cardsList,
    offset: resolvedOffset,
    start,
    reset,
  };
};

export interface DeckContextInit extends Pick<UseRouletteHandlersOptions, 'possibleCards'> {
  isRandomMode: boolean;
}

interface CurrentDeck {
  id: number;
  cards: HeroCardSchema[];
}

export interface DeckContextValue {
  setCurrentDeck: Dispatch<SetStateAction<CurrentDeck | null>>;
  currentDeck: CurrentDeck | null;
  droppedCards: HeroCardSchema[] | null;
  setDroppedCards: Dispatch<SetStateAction<HeroCardSchema[] | null>>;
  isPending: boolean;
  setIsPending: Dispatch<SetStateAction<boolean>>;
  deckHandlers: RouletteHandlers;
  speed: RouletteConfigSpeed;
  setSpeed: Dispatch<SetStateAction<RouletteConfigSpeed>>;
  isRandomMode: boolean;
}

export const { useStore: useDeckStore, Provider: DeckContextProvider } = createContextSelector<
  DeckContextValue,
  DeckContextInit
>((options) => {
  const { possibleCards, isRandomMode } = options;
  const [currentDeck, setCurrentDeck] = useState<CurrentDeck | null>(null);
  const [droppedCards, setDroppedCards] = useState<HeroCardSchema[] | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [speed, setSpeed] = useLocalStorageState<RouletteConfigSpeed>(RouletteConfigSpeed.MEDIUM);

  const deckHandlers = useRouletteHandlers({
    possibleCards,
    speed,
    onStart: () => setIsPending(true),
    onDrop: (deck: CurrentDeck) => {
      setCurrentDeck(deck);
      setIsPending(false);
    },
  });

  return {
    speed,
    setSpeed,
    currentDeck,
    setCurrentDeck,
    droppedCards,
    setDroppedCards,
    isPending,
    setIsPending,
    deckHandlers,
    isRandomMode,
  };
});
