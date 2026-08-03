'use client';

import { useEffect, useState } from 'react';

import { cn } from '@re/ui-kit/utils/cn';

const MAX_GUESSES = 6;

export type GuessResult = {
  letter: string;
  status: 'correct' | 'present' | 'absent';
}[];

export const checkGuess = (guess: string, answer: string): GuessResult => {
  const result: GuessResult = [];
  const answerLetters = answer.split('');
  const guessLetters = guess.toUpperCase().split('');

  guessLetters.forEach((letter, i) => {
    if (letter === answerLetters[i]) {
      result[i] = { letter, status: 'correct' };
      answerLetters[i] = '#';
    }
  });

  guessLetters.forEach((letter, i) => {
    if (!result[i]) {
      const index = answerLetters.indexOf(letter);
      if (index !== -1) {
        result[i] = { letter, status: 'present' };
        answerLetters[index] = '#';
      } else {
        result[i] = { letter, status: 'absent' };
      }
    }
  });

  return result;
};

export const WORDS = [
  'REACT',
  'WORLD',
  'HELLO',
  'BRAIN',
  'CLOUD',
  'DREAM',
  'EARTH',
  'FLAME',
  'GHOST',
  'HEART',
  'LIGHT',
  'MUSIC',
  'OCEAN',
  'PEACE',
  'QUEEN',
  'RIVER',
  'SPACE',
  'STORM',
  'TIGER',
  'WATER',
];

export const getRandomWord = () => {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
};

export const Wordle = () => {
  const [answer, setAnswer] = useState('');
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [usedKeys, setUsedKeys] = useState<Record<string, 'correct' | 'present' | 'absent'>>({});

  useEffect(() => {
    setAnswer(getRandomWord());
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;

      if (e.key === 'Enter') {
        handleGuess('ENTER');
      } else if (e.key === 'Backspace') {
        handleGuess('BACKSPACE');
      } else {
        const key = e.key.toUpperCase();
        if (key.length === 1 && key.match(/[A-Z]/)) {
          handleGuess(key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGuess, gameOver]);

  const handleGuess = (key: string) => {
    if (gameOver) return;

    if (key === 'ENTER') {
      if (currentGuess.length !== 5) {
        setMessage('Word must be 5 letters');
        return;
      }

      const result = checkGuess(currentGuess, answer);
      const newGuesses = [...guesses, result];
      setGuesses(newGuesses);

      const newUsedKeys = { ...usedKeys };
      result.forEach(({ letter, status }) => {
        const currentStatus = newUsedKeys[letter];
        if (status === 'correct' || (status === 'present' && currentStatus !== 'correct')) {
          newUsedKeys[letter] = status;
        } else if (!currentStatus && status === 'absent') {
          newUsedKeys[letter] = status;
        }
      });
      setUsedKeys(newUsedKeys);

      if (currentGuess === answer) {
        setGameOver(true);
        setMessage('Congratulations! You won! 🎉');
      } else if (newGuesses.length === MAX_GUESSES) {
        setGameOver(true);
        setMessage(`Game Over! The word was ${answer}`);
      }

      setCurrentGuess('');
    } else if (key === 'BACKSPACE') {
      setCurrentGuess((prev) => prev.slice(0, -1));
      setMessage('');
    } else if (currentGuess.length < 5) {
      setCurrentGuess((prev) => prev + key);
      setMessage('');
    }
  };

  return (
    <div className="bg-background flex min-h-screen flex-col items-center p-4">
      <h1 className="mb-8 text-4xl font-bold">Wordle Clone</h1>

      <div className="mb-8 space-y-2">
        {[...Array(MAX_GUESSES)].map((_, i) => (
          <div key={i} className="flex space-x-2">
            {[...Array(5)].map((_, j) => {
              const guess = guesses[i]?.[j];
              const isCurrentRow = i === guesses.length;
              const letter = isCurrentRow ? currentGuess[j] : guess?.letter;

              return (
                <div
                  key={j}
                  className={cn(
                    'flex h-14 w-14 items-center justify-center border-2 text-2xl font-bold',
                    {
                      'border-green-500 bg-green-500 text-white': guess?.status === 'correct',
                      'border-yellow-500 bg-yellow-500 text-white': guess?.status === 'present',
                      'border-gray-500 bg-gray-500 text-white': guess?.status === 'absent',
                      'border-gray-300': !guess,
                      'animate-bounce': letter && isCurrentRow,
                    }
                  )}
                >
                  {letter || ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {message && (
        <Alert className="mb-4">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Keyboard onKeyPress={handleGuess} usedKeys={usedKeys} />
    </div>
  );
};
