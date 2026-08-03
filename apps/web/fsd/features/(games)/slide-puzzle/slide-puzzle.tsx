'use client';

import { useEffect } from 'react';
import Image from 'next/image';

import { Card } from '@re/ui-kit/ui/card';

import { GRID_SIZE, PuzzleState } from '~entities/games/model/const';
import { usePuzzle } from '~entities/games/model/store';

export const SlidePuzzle = ({ onSuccess }: { onSuccess: () => void }) => {
  const {
    isActive,
    puzzle,
    setPuzzle,
    setIsActive,
    setTimer,
    timer,
    isComplete,
    setIsComplete,
    imageSet,
    moveCount,
    setMoveCount,
  } = usePuzzle();

  useEffect(() => {
    initializePuzzle();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && !isComplete) {
      interval = setInterval(() => {
        setTimer((timer) => timer + 1);
      }, 1000);
    } else if (!isActive && !isComplete) {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isComplete]);

  const isPuzzleSolved = (state: PuzzleState) => {
    return (
      state.slice(0, -1).every((num, index) => num === index + 1) &&
      state[state.length - 1] === null
    );
  };

  const createSolvablePuzzle = (): PuzzleState => {
    let newPuzzle: PuzzleState;
    let isSolvable;
    let isSolved;

    do {
      newPuzzle = [...Array(GRID_SIZE * GRID_SIZE - 1).keys()].map((x) => x + 1);
      newPuzzle.push(null);

      for (let i = newPuzzle.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newPuzzle[i], newPuzzle[j]] = [newPuzzle[j], newPuzzle[i]];
      }

      const countInversions = () => {
        const filtered = newPuzzle.filter((x) => x !== null) as number[];
        let inversions = 0;
        for (let i = 0; i < filtered.length; i++) {
          for (let j = i + 1; j < filtered.length; j++) {
            if (filtered[i] > filtered[j]) inversions++;
          }
        }
        return inversions;
      };

      const getBlankRowFromBottom = () => {
        const blankIndex = newPuzzle.indexOf(null);
        return GRID_SIZE - Math.floor(blankIndex / GRID_SIZE);
      };

      const inversions = countInversions();
      const blankRow = getBlankRowFromBottom();

      isSolvable = (inversions + blankRow) % 2 === 1;

      if (!isSolvable) {
        const first = newPuzzle.findIndex((x) => x !== null);
        const second = newPuzzle.findIndex((x, i) => x !== null && i > first);
        if (first !== -1 && second !== -1) {
          [newPuzzle[first], newPuzzle[second]] = [newPuzzle[second], newPuzzle[first]];
        }
      }

      isSolved = isPuzzleSolved(newPuzzle);
    } while (isSolved);

    return newPuzzle;
  };

  const initializePuzzle = () => {
    const newPuzzle = createSolvablePuzzle();
    setPuzzle(newPuzzle);
    setIsComplete(false);
    setTimer(0);
    setIsActive(true);
    setMoveCount(0);
  };

  const handleTileClick = (index: number) => {
    if (isComplete) return;
    const emptyIndex = puzzle.indexOf(null);
    if (isAdjacent(index, emptyIndex)) {
      const newPuzzle = [...puzzle];
      // @ts-ignore
      [newPuzzle[index], newPuzzle[emptyIndex]] = [newPuzzle[emptyIndex], newPuzzle[index]];
      setPuzzle(newPuzzle);
      setMoveCount((prevCount) => prevCount + 1);
      checkCompletion(newPuzzle);
    }
  };
  const isAdjacent = (index1: number, index2: number) => {
    const row1 = Math.floor(index1 / GRID_SIZE);
    const col1 = index1 % GRID_SIZE;
    const row2 = Math.floor(index2 / GRID_SIZE);
    const col2 = index2 % GRID_SIZE;
    return (
      (Math.abs(row1 - row2) === 1 && col1 === col2) ||
      (Math.abs(col1 - col2) === 1 && row1 === row2)
    );
  };

  const checkCompletion = (currentPuzzle: PuzzleState) => {
    const isComplete = isPuzzleSolved(currentPuzzle);

    if (isComplete) {
      setIsComplete(true);
      setIsActive(false);
      onSuccess();
    }
  };

  return (
    <div
      className="grid overflow-hidden rounded-md"
      style={{
        gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
        gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
      }}
    >
      {puzzle.map((value, index) => (
        <Card
          key={index}
          className="border-border text-card-foreground flex cursor-pointer items-center justify-center rounded-[0] border select-none"
          onClick={() => handleTileClick(index)}
        >
          {value ? (
            <Image
              src={imageSet[value] as string}
              alt="image"
              draggable={false}
              width={144}
              height={144}
            />
          ) : null}
        </Card>
      ))}
    </div>
  );
};
