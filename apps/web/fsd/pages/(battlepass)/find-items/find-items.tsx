'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import { Badge } from '@re/ui-kit/ui/badge';
import { Card, CardContent } from '@re/ui-kit/ui/card';
import confetti from 'canvas-confetti';

import { useManageMinigame } from '~entities/battlepass/model/mutations';
import { importToastAsync } from '~shared/ui/toast/toast.async';

export interface ItemSchema {
  x: number;
  y: number;
  radius: number;
  name: string;
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default function FindItems({ items, image }: { items: ItemSchema[]; image: string }) {
  const [foundItems, setFoundItems] = useState<number[]>([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
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
    if (foundItems.length === items.length) {
      setGameCompleted(true);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      (async () => {
        await mutateAsync({ game_id: 100 });
        await confetti();
        const toast = await importToastAsync();
        toast.success('Вы успешно нашли все отличия!');
      })();
    }
  }, [foundItems, timeElapsed]);

  const highlightItem = (index: number) => {
    const diff = items[index]!;

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

    applyHighlight(imageRef.current);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameCompleted) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const aspectRatio = rect.width / 999;

    items.forEach((item, index) => {
      const diffX = item.x * aspectRatio;
      const diffY = item.y * aspectRatio;

      const distance = Math.sqrt(Math.pow(x - diffX, 2) + Math.pow(y - diffY, 2));

      if (distance <= item.radius && !foundItems.includes(index)) {
        setFoundItems((prev) => [...prev, index]);

        highlightItem(index);
      }
    });
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 flex w-full flex-col items-center justify-between gap-4 sm:flex-row">
        <Card className="w-full sm:w-auto">
          <CardContent className="flex items-center gap-2 p-4">
            <span className="font-mono text-lg">{formatTime(timeElapsed)}</span>
          </CardContent>
        </Card>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 text-sm">
            {foundItems.length}/{items.length} найдено
          </Badge>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
        {items.map((it, index) => {
          const isFound = foundItems.includes(index);

          return (
            <Badge key={index} variant={isFound ? 'success' : 'outline'}>
              {it.name}
            </Badge>
          );
        })}
      </div>

      {gameCompleted ? (
        <div className="mb-8 max-w-md text-center">
          <h2 className="mb-2 text-xl font-bold">Отличная работа!</h2>
          <p className="text-muted-foreground">Найдены все предметы за {timeElapsed} сек.!</p>
        </div>
      ) : (
        <div className="mb-8 max-w-md text-center">
          <p className="text-muted-foreground">
            Найди все предметы. Нажимай на участок изображения, где он находится!
          </p>
        </div>
      )}

      <div className="flex w-full max-w-[1440px] items-center justify-center">
        <div
          ref={imageRef}
          className="relative basis-full cursor-crosshair overflow-hidden rounded-lg border md:basis-1/2"
          onClick={handleImageClick}
        >
          <Image
            src={image}
            width={600}
            height={600}
            draggable={false}
            alt="Найди отличия 1"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
