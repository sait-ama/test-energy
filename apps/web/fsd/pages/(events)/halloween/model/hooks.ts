import React, { ComponentProps, useEffect, useRef, useState } from 'react';

import { logger } from '~shared/lib/logger';

interface AudioPlayerProps {
  src: string;
  loop?: boolean;
  autoPlay?: boolean;
  preload?: boolean;
  volume?: number;
  onEnd?: () => void;
}

export const useAudio = ({
  src,
  loop = false,
  autoPlay = false,
  preload = true,
  volume = 0.5,
  onEnd,
}: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const audio = new Audio(src);
    audioRef.current = audio;

    audio.loop = loop;
    audio.volume = volume;
    audio.preload = preload ? 'auto' : 'none';

    const handleLoad = () => setIsLoaded(true);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnd = () => {
      setIsPlaying(false);
      onEnd?.();
    };

    audio.addEventListener('loadeddata', handleLoad);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnd);

    if (autoPlay && preload) {
      const playAudio = async () => {
        try {
          await audio.play();
        } catch (error) {
          console.warn('Auto-play was prevented:', error);
          setIsPlaying(false);
        }
      };
      playAudio();
    }

    return () => {
      audio.removeEventListener('loadeddata', handleLoad);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnd);

      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [src, loop, autoPlay, preload, volume, onEnd]);

  const play = async () => {
    if (!audioRef.current) return;

    try {
      await audioRef.current.play();
    } catch (error) {
      setIsPlaying(false);

      logger.error(error, { scope: ['audio'] });
    }
  };

  const pause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
    audioRef.current?.pause();
  };

  const stop = () => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  const setVolume = (newVolume: number) => {
    if (!audioRef.current) return;

    audioRef.current.volume = Math.max(0, Math.min(1, newVolume));
  };

  const toggle = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  return {
    play,
    pause,
    stop,
    toggle,
    setVolume,
    isPlaying,
    isLoaded,
    audioElement: audioRef.current,
  };
};
export type InViewOptions = ComponentProps<'div'> &
  Partial<IntersectionObserverInit> & {
    once?: boolean;
  };
// он просто проще
export const useInView = (options: InViewOptions = {}) => {
  const { once = true, ...obsOptions } = options;
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (once) {
          if (entry?.isIntersecting) {
            setIsInView(true);
            if (ref.current) {
              try {
                observer.unobserve(ref.current);
              } catch (_) {
                // ignore
              }
            }
            observer.disconnect();
          }
        } else {
          setIsInView(!!entry?.isIntersecting);
        }
      },
      {
        threshold: 0.1,
        ...obsOptions,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      try {
        if (ref.current) observer.unobserve(ref.current);
        observer.disconnect();
      } catch (e: unknown) {
        // ignore
        logger?.warn?.(String(e));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [once, JSON.stringify(obsOptions)]);

  return [ref as React.RefObject<HTMLDivElement>, isInView] as const;
};
export const useBgAudio = (props?: Partial<Parameters<typeof useAudio>[0]>) => {
  const {
    src = '/halloween/halloween-background-mucic.mp3',
    loop = true,
    volume = 0.2,
    autoPlay = true,
    preload = true,
    ...other
  } = props ?? {};
  return useAudio({
    src,
    loop,
    autoPlay,
    volume,
    preload,
    ...other,
  });
};
