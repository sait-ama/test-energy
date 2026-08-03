import { useEffect } from 'react';

import { createContext } from '@re/core/utils/create-context';

import { useBgAudio } from '~pages/(events)/halloween/model/hooks';

export const { useStore: useBgAudioState, Provider: BgAudioStateProvider } = createContext<
  ReturnType<typeof useBgAudio>,
  Parameters<typeof useBgAudio>[0]
>((params = {}) => {
  const date = useBgAudio(params);
  useEffect(() => {
    return () => {
      date.audioElement?.remove?.();
    };
  }, [date.audioElement]);
  return date;
});
