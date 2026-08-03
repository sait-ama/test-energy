'use client';

import { useEffect, useState } from 'react';

type CardType = {
  id: number;
  imageUrl: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const images = [];

export default function MemoryGame() {
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const shuffledImages = [...images, ...images]
      .sort(() => Math.random() - 0.5)
      .map((imageUrl, index) => ({
        id: index,
        imageUrl,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffledImages);
    setFlippedCards([]);
    setMatchedPairs(0);
  };

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2) return;
    if (cards[id].isMatched) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    setFlippedCards([...flippedCards, id]);

    if (flippedCards.length === 1) {
      setTimeout(checkMatch, 1000);
    }
  };

  const checkMatch = () => {
    const [firstCardId, secondCardId] = flippedCards;
    const newCards = [...cards];

    if (cards[firstCardId].imageUrl === cards[secondCardId].imageUrl) {
      newCards[firstCardId].isMatched = true;
      newCards[secondCardId].isMatched = true;
      setMatchedPairs(matchedPairs + 1);
    } else {
      newCards[firstCardId].isFlipped = false;
      newCards[secondCardId].isFlipped = false;
    }

    setCards(newCards);
    setFlippedCards([]);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-center text-3xl font-bold">Memory Game</h1>
      <div className="mb-4 grid grid-cols-5 gap-4">
        {cards.map((card) => (
          <Card
            key={card.id}
            className={`flex h-20 w-20 cursor-pointer items-center justify-center transition-all duration-300 ${
              card.isFlipped || card.isMatched ? 'bg-primary' : 'bg-secondary'
            }`}
            onClick={() => handleCardClick(card.id)}
          >
            {(card.isFlipped || card.isMatched) && (
              <img
                src={card.imageUrl || '/placeholder.svg'}
                alt="Card"
                className="h-16 w-16 object-cover"
              />
            )}
          </Card>
        ))}
      </div>
      <div className="text-center">
        <p className="mb-2">Matched Pairs: {matchedPairs} / 12</p>
        <Button onClick={initializeGame} className="flex items-center">
          <Shuffle className="mr-2 h-4 w-4" /> Restart Game
        </Button>
      </div>
    </div>
  );
}
