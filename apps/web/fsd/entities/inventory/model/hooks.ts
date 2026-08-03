import { RefObject, useEffect, useRef } from 'react';

import { useHeroCardControlsStore } from './stores';

export type UseHeroCardControlsOptions = {
  rewrites?: {
    isAnimationEnabled?: boolean | null;
    isSoundEnabled?: boolean | null;
  };
};

export const useHeroCardControls = (
  mediaRef: RefObject<HTMLVideoElement | null>,
  _options?: UseHeroCardControlsOptions
) => {
  const options = {
    rewrites: {
      isSoundEnabled: false,
      isAnimationEnabled: null,
      ...(_options?.rewrites ?? {}),
    },
    ...(_options ?? {}),
  };

  const { isAnimationEnabled, isSoundEnabled } = useHeroCardControlsStore();
  const prevAnimationEnabled = useRef<boolean | null>(null);
  const prevSoundEnabled = useRef<boolean | null>(null);

  useEffect(() => {
    if (!mediaRef.current || !(mediaRef.current instanceof HTMLVideoElement)) return;

    const resolvedValue = options.rewrites.isSoundEnabled ?? isSoundEnabled;

    if (prevSoundEnabled.current === resolvedValue) return;

    mediaRef.current.muted = !resolvedValue;

    prevSoundEnabled.current = resolvedValue;
  }, [isSoundEnabled, mediaRef, options.rewrites.isSoundEnabled]);

  useEffect(() => {
    if (!mediaRef.current || !(mediaRef.current instanceof HTMLVideoElement)) return;

    const resolvedValue = options.rewrites.isAnimationEnabled ?? isAnimationEnabled;

    if (resolvedValue) {
      setTimeout(async () => {
        await mediaRef.current?.play();
      }, 20);
    } else {
      setTimeout(() => {
        mediaRef.current?.pause?.();
      }, 10);
    }

    prevAnimationEnabled.current = resolvedValue;
  }, [isAnimationEnabled, mediaRef, options.rewrites.isAnimationEnabled]);
};
