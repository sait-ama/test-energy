'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@re/ui-kit/ui/button';

type GameObject = { x: number; y: number };
const LOGICAL_WIDTH = 800;
const LOGICAL_HEIGHT = 600;

export const CollectCookiesGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const playerPos = useRef({ x: LOGICAL_WIDTH / 2 - 20, y: LOGICAL_HEIGHT - 40 });
  const objects = useRef({ candies: [] as GameObject[], mushrooms: [] as GameObject[] });
  const gameTimers = useRef({ game: -1, candy: -1, mushroom: -1, timer: -1 });
  const mushroomImage = useRef(new Image());
  const scale = useRef(1);
  const dpr = useRef(1);
  const isTabActive = useRef(true);

  const calculateDimensions = useCallback(() => {
    if (!containerRef.current) return { width: 0, height: 0 };
    const container = containerRef.current;
    const maxWidth = container.clientWidth;
    const maxHeight = window.innerHeight * 0.7;
    const scaleFactor = Math.min(maxWidth / LOGICAL_WIDTH, maxHeight / LOGICAL_HEIGHT);
    return { width: LOGICAL_WIDTH * scaleFactor, height: LOGICAL_HEIGHT * scaleFactor };
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;
    const { width, height } = calculateDimensions();
    dpr.current = window.devicePixelRatio;
    canvas.width = width * dpr.current;
    canvas.height = height * dpr.current;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    scale.current = width / LOGICAL_WIDTH;
  }, [calculateDimensions]);

  const updateGame = useCallback(() => {
    if (!isTabActive.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const getCanvasHSL = (cssVariable: string) => {
      const value = getComputedStyle(document.documentElement).getPropertyValue(cssVariable).trim();

      const [h, s, l] = value.split(' ');
      return `hsl(${h}, ${s}, ${l})`;
    };

    ctx.save();
    ctx.scale(dpr.current * scale.current, dpr.current * scale.current);
    ctx.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    ctx.fillStyle = getCanvasHSL('--r-background');
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    ctx.fillStyle = getCanvasHSL('--r-primary');
    ctx.fillRect(playerPos.current.x, playerPos.current.y, 40, 40);

    const checkCollision = (obj: GameObject) =>
      obj.y <= LOGICAL_HEIGHT &&
      obj.y + 20 > playerPos.current.y &&
      obj.x < playerPos.current.x + 40 &&
      obj.x + 20 > playerPos.current.x;

    const currentCandies = [...objects.current.candies];
    objects.current.candies = currentCandies.reduce((acc, candy) => {
      candy.y += 2;

      if (candy.y > LOGICAL_HEIGHT + 20) return acc;

      ctx.font = '20px Arial';
      ctx.fillText('🍪', candy.x, candy.y + 20);

      if (checkCollision(candy)) {
        setScore((s) => s + Math.floor(Math.random() * 10) + 1);
        return acc;
      }

      return [...acc, candy];
    }, [] as GameObject[]);

    const currentMushrooms = [...objects.current.mushrooms];
    objects.current.mushrooms = currentMushrooms.reduce((acc, mushroom) => {
      mushroom.y += 2;

      if (mushroom.y > LOGICAL_HEIGHT + 20) return acc;

      if (mushroomImage.current.complete) {
        ctx.drawImage(mushroomImage.current, mushroom.x, mushroom.y, 20, 20);
      }

      if (checkCollision(mushroom)) {
        const rand = Math.random();
        if (rand < 0.5) startHallucination();
        else if (rand < 0.8) setScore((s) => s + Math.floor(Math.random() * 35) + 1);
        else setTimeLeft((t) => t + Math.floor(Math.random() * 75) + 1);
        return acc;
      }

      return [...acc, mushroom];
    }, [] as GameObject[]);

    ctx.restore();
  }, []);

  const startHallucination = useCallback(() => {
    const hallucinationSound = new Audio('/battlepass-cookies/shiza.mp3');

    const createElement = (text?: string) => {
      const el = document.createElement('div');
      el.style.cssText = `
                position: fixed;
                pointer-events: none;
                animation: 
                    rainbow 1s infinite alternate,
                    ${Math.random() < 0.5 ? 'shake' : 'float'} 1s infinite;
                ${text ? `font-size: 30px; color: rgba(255,255,255,0.8);` : ''}
                top: ${Math.random() * 100}vh;
                left: ${Math.random() * 100}vw;
                z-index: 9999;
            `;
      if (text) el.textContent = text;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2000);
    };

    for (let i = 0; i < 30; i++) createElement();
    for (let i = 0; i < 25; i++) createElement('ШИЗА');

    document.body.style.animation = 'screenShake 0.1s infinite';
    hallucinationSound.play().catch(() => {});

    setTimeout(() => {
      document.body.style.animation = '';
    }, 15000);
  }, []);

  const handleKey = useCallback((direction: 'left' | 'right') => {
    const newX =
      direction === 'left'
        ? Math.max(0, playerPos.current.x - 50)
        : Math.min(LOGICAL_WIDTH - 40, playerPos.current.x + 50);
    playerPos.current.x = newX;
  }, []);

  const handleTouch = useCallback((clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const gameX = ((clientX - rect.left) / rect.width) * LOGICAL_WIDTH;
    playerPos.current.x = Math.max(0, Math.min(LOGICAL_WIDTH - 40, gameX - 20));
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      isTabActive.current = !document.hidden;
      if (isTabActive.current) {
        gameTimers.current.game = window.setInterval(updateGame, 20);
      } else {
        clearInterval(gameTimers.current.game);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [updateGame]);

  useEffect(() => {
    mushroomImage.current.src = '/battlepass-cookies/muchomor.png';
    resizeCanvas();
    containerRef.current?.focus();

    const onResize = () => {
      resizeCanvas();
      playerPos.current.x = LOGICAL_WIDTH / 2 - 20;
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    gameTimers.current.game = window.setInterval(updateGame, 20);
    gameTimers.current.candy = window.setInterval(() => {
      objects.current.candies.push({ x: Math.random() * (LOGICAL_WIDTH - 20), y: 0 });
    }, 1000);

    gameTimers.current.mushroom = window.setInterval(() => {
      if (Math.random() < 0.35) {
        objects.current.mushrooms.push({ x: Math.random() * (LOGICAL_WIDTH - 20), y: 0 });
      }
    }, 5000);

    gameTimers.current.timer = window.setInterval(() => {
      setTimeLeft((t) => (t <= 1 ? (clearAllIntervals(), 0) : t - 1));
    }, 1000);

    const clearAllIntervals = () => {
      Object.values(gameTimers.current).forEach(clearInterval);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      if (timeLeft <= 1) alert(`Игра окончена! Счёт: ${score}`);
    };

    return clearAllIntervals;
  }, [resizeCanvas, score, updateGame]);

  return (
    <div className="flex h-screen w-full flex-col p-4">
      <div
        ref={containerRef}
        className="outline-hidden"
        tabIndex={0}
        onKeyDown={(e) => {
          if (['ArrowLeft', 'a'].includes(e.key)) handleKey('left');
          if (['ArrowRight', 'd'].includes(e.key)) handleKey('right');
        }}
        onTouchStart={(e) => handleTouch(e.touches[0]!.clientX)}
        onTouchMove={(e) => handleTouch(e.touches[0]!.clientX)}
      >
        <canvas
          ref={canvasRef}
          className="border-border overflow-hidden rounded-md border"
          style={{
            maxWidth: '100%',
            maxHeight: '70vh',
            aspectRatio: '4/3',
            touchAction: 'none',
          }}
        />
      </div>

      <div className="mt-4 space-y-2 text-center">
        <p className="text-xl font-bold">Счёт: {score}</p>
        <p className="text-xl font-bold">Время: {timeLeft}с</p>
        <Button className="mt-2 px-6 py-2">Новая игра</Button>
      </div>

      <style jsx global>{`
        @keyframes screenShake {
          0%,
          100% {
            transform: translate(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translate(-10px, -10px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translate(10px, 10px);
          }
        }

        @keyframes rainbow {
          0% {
            filter: hue-rotate(0deg);
          }
          100% {
            filter: hue-rotate(360deg);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translate(0);
          }
          25% {
            transform: translate(-20px, -15px);
          }
          50% {
            transform: translate(20px, 15px);
          }
          75% {
            transform: translate(-20px, 15px);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
};
