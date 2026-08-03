'use client';
import React, { useEffect, useState } from 'react';
import NextImage from 'next/image';

import { Badge } from '@re/ui-kit/ui/badge';
import { ReText } from '@re/ui-kit/ui/text';

import { useManageMinigame } from '~entities/battlepass/model/mutations';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { randInt } from '~shared/utils/rand-int';
import { UrlFormatter } from '~shared/utils/url-formatter';

const symbols = Array.from({ length: 8 }, (_, index) => index + 1);

interface Card {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryGame = () => {
  const { mutateAsync } = useManageMinigame();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  const initializeGame = () => {
    const duplicatedSymbols = [...symbols, ...symbols];
    const variant = randInt(1, 7);
    const shuffledCards = duplicatedSymbols
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol: symbol * variant,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2 || flippedCards.includes(id) || cards[id].isMatched) return;

    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves((prev) => prev + 1);
      const [firstId, secondId] = newFlippedCards;

      if (cards[firstId].symbol === cards[secondId].symbol) {
        setCards((prev) =>
          prev.map((card) =>
            card.id === firstId || card.id === secondId
              ? {
                  ...card,
                  isMatched: true,
                }
              : card
          )
        );
        setFlippedCards([]);
      } else {
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    (async () => {
      if (cards.length && cards.every((card) => card.isMatched)) {
        try {
          const toast = await importToastAsync();
          await mutateAsync({ game_id: 48 });
          toast.success('Вы выиграли!');
        } catch (e) {
          logger.error(e);
          await resolveErrorAsync(e);
        }
      }
    })();
  }, [cards]);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex w-full items-center justify-between gap-4 px-2">
        <div className="flex flex-col gap-1">
          <ReText size="2xl" weight="bold" color="foreground">
            Игра на память
          </ReText>
          <ReText size="sm" color="muted-foreground">
            Найди пару для каждой карточки для выполнения задания
          </ReText>
        </div>

        <Badge color="secondary" className="text-md px-4">
          Ходов: {moves}
        </Badge>
      </div>

      <div className="grid h-full w-full max-w-3xl grid-cols-4 gap-4 p-8">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`relative flex aspect-[2/3] transform items-center justify-center rounded-xl border text-4xl transition-all duration-300 ${
              card.isMatched || flippedCards.includes(card.id)
                ? 'border-primary rotate-0 border-2'
                : 'border-border rotate-y-180'
            } ${card.isMatched ? 'cursor-default opacity-50' : 'cursor-pointer hover:scale-105'}`}
            disabled={card.isMatched}
          >
            {card.isMatched || flippedCards.includes(card.id) ? (
              <NextImage
                src={UrlFormatter.media(
                  `public/battlepass-memory/${card.symbol.toString().padStart(3, '0')}.webp`
                )}
                fill
                alt="card"
              />
            ) : (
              <NextImage
                src={UrlFormatter.media('public/modal/random-card.webp')}
                fill
                alt="card"
              />
            )}
          </button>
        ))}
      </div>
      <style global jsx>{`
        * {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </div>
  );
};
