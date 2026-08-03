'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import confetti from 'canvas-confetti';

import { Badge } from '@re/ui-kit/ui/badge';
import { Card, CardContent } from '@re/ui-kit/ui/card';
import { Progress } from '@re/ui-kit/ui/progress';

import { useManageMinigame } from '~entities/battlepass/model/mutations';
import { importToastAsync } from '~shared/ui/toast/toast.async';

export interface Difference {
  x: number;
  y: number;
  radius: number;
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default function SpotTheDifference({
  differences,
  images,
}: {
  differences: Difference[];
  images: [string, string];
}) {
  const [foundDifferences, setFoundDifferences] = useState<number[]>([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const leftImageRef = useRef<HTMLDivElement>(null);
  const rightImageRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { mutateAsync } = useManageMinigame();

  useEffect(() => {
    if (!gameCompleted) {
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameCompleted]);

  useEffect(() => {
    if (foundDifferences.length === differences.length) {
      setGameCompleted(true);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      (async () => {
        await mutateAsync({ game_id: 63 });
        await confetti();
        const toast = await importToastAsync();
        toast.success('Вы успешно нашли все отличия!');
      })();
    }
  }, [foundDifferences, timeElapsed]);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameCompleted) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const aspectRatio = rect.width / 999;

    differences.forEach((diff, index) => {
      const diffX = diff.x * aspectRatio;
      const diffY = diff.y * aspectRatio;

      const distance = Math.sqrt(Math.pow(x - diffX, 2) + Math.pow(y - diffY, 2));

      if (distance <= diff.radius && !foundDifferences.includes(index)) {
        setFoundDifferences((prev) => [...prev, index]);

        highlightDifference(index);
      }
    });
  };

  const highlightDifference = (index: number) => {
    const diff = differences[index]!;

    const applyHighlight = (container: HTMLDivElement | null) => {
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const aspectRatio = rect.width / 999;

      const scaledX = diff.x * aspectRatio;
      const scaledY = diff.y * aspectRatio;
      const scaledRadius = diff.radius * aspectRatio;

      const highlight = document.createElement('div');
      highlight.className =
        'absolute rounded-full border-2 border-green-500 animate-pulse pointer-events-none';
      highlight.style.width = `${scaledRadius * 2}px`;
      highlight.style.height = `${scaledRadius * 2}px`;
      highlight.style.left = `${scaledX - scaledRadius}px`;
      highlight.style.top = `${scaledY - scaledRadius}px`;

      container.appendChild(highlight);
    };

    applyHighlight(leftImageRef.current);
    applyHighlight(rightImageRef.current);
  };

  const [leftImageUrl, rightImageUrl] = images;

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 flex w-full flex-col items-center justify-between gap-4 sm:flex-row">
        <Card className="w-full sm:w-auto">
          <CardContent className="flex items-center gap-2 p-4">
            {/*<Timer className="text-muted-foreground h-5 w-5" />*/}
            <span className="font-mono text-lg">{formatTime(timeElapsed)}</span>
          </CardContent>
        </Card>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 text-sm">
            {/*<Trophy className="mr-1 h-4 w-4" />*/}
            {foundDifferences.length}/{differences.length} найдено
          </Badge>
        </div>
      </div>

      <Progress
        value={(foundDifferences.length / differences.length) * 100}
        className="mb-6 h-2 w-full"
      />

      {gameCompleted ? (
        <div className="mb-8 max-w-md text-center">
          <h2 className="mb-2 text-xl font-bold">Отличная работа!</h2>
          <p className="text-muted-foreground">
            Найдены все {differences.length} отличий за {timeElapsed} сек.!
          </p>
        </div>
      ) : (
        <div className="mb-8 max-w-md text-center">
          <p className="text-muted-foreground">
            Найди все {differences.length} отличий. Нажимай на участок изображения, где оно
            отличается с соседним, чтобы играть!
          </p>
        </div>
      )}

      <div className="grid w-full max-w-[1440px] grid-cols-1 gap-4 md:grid-cols-2">
        <div
          ref={leftImageRef}
          className="relative cursor-crosshair overflow-hidden rounded-lg border"
          onClick={handleImageClick}
        >
          <Image
            src={leftImageUrl}
            width={600}
            height={600}
            draggable={false}
            alt="Найди отличия 1"
            className="w-full"
          />
        </div>

        <div
          ref={rightImageRef}
          className="relative cursor-crosshair overflow-hidden rounded-lg border"
          onClick={handleImageClick}
        >
          <Image
            src={rightImageUrl}
            width={600}
            height={600}
            draggable={false}
            alt="Найди отличия 2"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
