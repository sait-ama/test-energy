'use client';
import { Dispatch, SetStateAction, useState } from 'react';

import { createContextSelector } from '@re/core/utils/create-context-selector';

import { PuzzleState } from '~entities/games/model/const';

interface PuzzleContext {
  puzzle: PuzzleState;
  isComplete: boolean;
  timer: number;
  isActive: boolean;
  moveCount: number;
  imageSet: Record<number, string>;
  setPuzzle: Dispatch<SetStateAction<PuzzleState>>;
  setIsComplete: Dispatch<SetStateAction<boolean>>;
  setTimer: Dispatch<SetStateAction<number>>;
  setIsActive: Dispatch<SetStateAction<boolean>>;
  setMoveCount: Dispatch<SetStateAction<number>>;
}

export const {
  Provider: PuzzleProvider,
  useStore: usePuzzle,
  Consumer: PuzzleConsumer,
} = createContextSelector<PuzzleContext, Record<number, string>>((imageSet) => {
  const [puzzle, setPuzzle] = useState<PuzzleState>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [moveCount, setMoveCount] = useState(0);

  return {
    puzzle,
    setPuzzle,
    isComplete,
    setIsComplete,
    timer,
    setTimer,
    isActive,
    setIsActive,
    moveCount,
    setMoveCount,
    imageSet,
  };
});
