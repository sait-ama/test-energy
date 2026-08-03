'use client';

import { useEffect, useState } from 'react';

import ReloadIcon from '@re/ui-kit/icons/reload';
import { Badge } from '@re/ui-kit/ui/badge';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { submitMatch3 } from '~entities/games/model/actions';
import { importToastAsync } from '~shared/ui/toast/toast.async';

const BOARD_SIZE = 8;
const GEMS = [
  { icon: () => '1', color: 'text-red-500' },
  { icon: () => '2', color: 'text-blue-500' },
  { icon: () => 3, color: 'text-green-500' },
  { icon: () => 4, color: 'text-purple-500' },
];

type Position = {
  x: number;
  y: number;
};

export const Match3 = () => {
  const [board, setBoard] = useState<number[][]>([]);
  const [score, setScore] = useState(0);
  const [selectedGem, setSelectedGem] = useState<Position | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    initializeBoard();
  }, []);

  const createBoard = (): number[][] => {
    const newBoard = Array(BOARD_SIZE)
      .fill(0)
      .map(() =>
        Array(BOARD_SIZE)
          .fill(0)
          .map(() => Math.floor(Math.random() * GEMS.length))
      );
    return newBoard;
  };

  const hasInitialMatches = (board: number[][]): boolean => {
    return findMatches(board).length > 0;
  };

  const hasPossibleMoves = (board: number[][]): boolean => {
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE - 1; x++) {
        const tempBoard = board.map((row) => [...row]);
        // @ts-ignore
        [tempBoard[y][x], tempBoard[y][x + 1]] = [tempBoard[y][x + 1], tempBoard[y][x]];
        if (findMatches(tempBoard).length > 0) return true;
      }
    }

    for (let y = 0; y < BOARD_SIZE - 1; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const tempBoard = board.map((row) => [...row]);
        // @ts-ignore
        [tempBoard[y][x], tempBoard[y + 1][x]] = [tempBoard[y + 1][x], tempBoard[y][x]];
        if (findMatches(tempBoard).length > 0) return true;
      }
    }

    return false;
  };

  const initializeBoard = () => {
    let newBoard;
    do {
      newBoard = createBoard();
    } while (hasInitialMatches(newBoard) || !hasPossibleMoves(newBoard));

    setBoard(newBoard);
    setScore(0);
    setSelectedGem(null);
    setIsAnimating(false);
  };

  const handleGemClick = async (x: number, y: number) => {
    if (isAnimating) return;

    if (!selectedGem) {
      setSelectedGem({ x, y });
    } else {
      const dx = Math.abs(selectedGem.x - x);
      const dy = Math.abs(selectedGem.y - y);

      if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
        await swapGems(selectedGem, { x, y });
      }

      setSelectedGem(null);
    }
  };

  const swapGems = async (pos1: Position, pos2: Position) => {
    setIsAnimating(true);

    const newBoard = board.map((row) => [...row]);
    // @ts-ignore
    [newBoard[pos1.y][pos1.x], newBoard[pos2.y][pos2.x]] = [
      newBoard[pos2.y]![pos2.x],
      newBoard[pos1.y]![pos1.x],
    ];

    setBoard(newBoard);

    const matches = findMatches(newBoard);
    if (matches.length > 0) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      await handleMatches(matches);
    } else {
      await new Promise((resolve) => setTimeout(resolve, 300));
      // @ts-ignore
      [newBoard[pos1.y][pos1.x], newBoard[pos2.y][pos2.x]] = [
        newBoard[pos2.y]![pos2.x],
        newBoard[pos1.y]![pos1.x],
      ];
      setBoard(newBoard);
    }

    setIsAnimating(false);

    if (!hasPossibleMoves(newBoard)) {
      alert('Нет следующих шагов, игра окончена.');
      initializeBoard();
    }
  };

  const findMatches = (currentBoard: number[][]): Position[] => {
    const matches: Position[] = [];
    const addMatch = (x: number, y: number) => {
      if (!matches.some((m) => m.x === x && m.y === y)) {
        matches.push({ x, y });
      }
    };

    for (let y = 0; y < BOARD_SIZE; y++) {
      let count = 1;
      let currentGem = currentBoard[y]![0];

      for (let x = 1; x < BOARD_SIZE; x++) {
        if (currentBoard[y]![x] === currentGem) {
          count++;
          if (count >= 3) {
            for (let i = 0; i < count; i++) {
              addMatch(x - i, y);
            }
          }
        } else {
          count = 1;
          currentGem = currentBoard[y]![x];
        }
      }
    }

    for (let x = 0; x < BOARD_SIZE; x++) {
      let count = 1;
      let currentGem = currentBoard[0]![x];

      for (let y = 1; y < BOARD_SIZE; y++) {
        if (currentBoard[y]![x] === currentGem) {
          count++;
          if (count >= 3) {
            for (let i = 0; i < count; i++) {
              addMatch(x, y - i);
            }
          }
        } else {
          count = 1;
          currentGem = currentBoard[y]![x];
        }
      }
    }

    return matches;
  };

  const handleMatches = async (matches: Position[]) => {
    const newBoard = board.map((row) => [...row]);
    matches.forEach(({ x, y }) => {
      newBoard[y]![x] = -1;
    });
    setBoard(newBoard);
    setScore((prev) => prev + matches.length * 100);

    await new Promise((resolve) => setTimeout(resolve, 300));

    let hasDropped;
    do {
      hasDropped = false;
      for (let x = 0; x < BOARD_SIZE; x++) {
        for (let y = BOARD_SIZE - 1; y > 0; y--) {
          if (newBoard[y]![x] === -1) {
            for (let above = y - 1; above >= 0; above--) {
              if (newBoard[above]![x] !== -1) {
                // @ts-ignore
                newBoard[y][x] = newBoard[above]![x];
                newBoard[above]![x] = -1;
                hasDropped = true;
                break;
              }
            }
          }
        }
      }
    } while (hasDropped);

    for (let x = 0; x < BOARD_SIZE; x++) {
      for (let y = 0; y < BOARD_SIZE; y++) {
        if (newBoard[y]![x] === -1) {
          newBoard[y]![x] = Math.floor(Math.random() * GEMS.length);
        }
      }
    }

    setBoard(newBoard);

    const newMatches = findMatches(newBoard);
    if (newMatches.length > 0) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      await handleMatches(newMatches);
    }
  };

  const handleFinish = async () => {
    const toast = await importToastAsync();
    if (score < 20000) {
      toast.error('Нужно как минимум 20 000 очков');
      return;
    }

    await submitMatch3();
    toast.success('Задача успешно засчитана');
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <ReText size="2xl" weight="bold" color="foreground">
            Три в ряд
          </ReText>
          <ReText size="sm" color="muted-foreground">
            Собери 20000 очков для выполнения задания
          </ReText>
        </div>

        <Badge color="secondary" className="text-md px-4">
          Очки: {score}
        </Badge>
      </div>

      <div className="border-border grid gap-2 overflow-hidden rounded-md border p-4">
        {board.map((row, y) => (
          <div key={y} className="flex gap-2">
            {row.map((gem, x) => {
              const GemIcon = gem >= 0 ? GEMS[gem].icon : null;
              return (
                <Button
                  key={`${x}-${y}`}
                  variant="ghost"
                  className={cn(
                    'h-12 w-12 p-0 transition-all duration-300',
                    selectedGem?.x === x && selectedGem?.y === y && 'ring-2 ring-white',
                    gem === -1 && 'opacity-0'
                  )}
                  onClick={() => handleGemClick(x, y)}
                >
                  {GemIcon && (
                    <GemIcon
                      className={cn(
                        'h-8 w-8 transition-transform',
                        GEMS[gem].color,
                        selectedGem?.x === x && selectedGem?.y === y && 'scale-110'
                      )}
                    />
                  )}
                </Button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex w-full justify-between">
        <Button
          startIcon={<ReloadIcon />}
          color="secondary"
          className="px-8"
          onClick={initializeBoard}
        >
          Новая игра
        </Button>
        <Button color="secondary" className="px-8" onClick={handleFinish}>
          Завершить
        </Button>
      </div>
    </div>
  );
};
