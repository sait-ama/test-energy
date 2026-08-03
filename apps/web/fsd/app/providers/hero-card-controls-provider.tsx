import { ReactNode } from 'react';
import { cookies } from 'next/headers';

import { HeroCardControlsGlobalProvider } from '~entities/inventory/model/stores';
import { parseJson } from '~shared/utils/parse-json';

export const HeroCardControlsGlobalServerProvider = async ({
  children,
}: {
  children: ReactNode;
}) => {
  const cookieStore = await cookies();

  const storedAnimationEnabled = cookieStore.get('hero-card-animation-enabled');

  const isAnimationEnabled = storedAnimationEnabled
    ? !!parseJson(storedAnimationEnabled.value)
    : true;

  const storedSoundEnabled = cookieStore.get('hero-card-sound-enabled');

  const isSoundEnabled = storedSoundEnabled ? !!parseJson(storedSoundEnabled.value) : true;

  return (
    <HeroCardControlsGlobalProvider
      defaultValues={{
        isAnimationEnabled,
        isSoundEnabled,
      }}
    >
      {children}
    </HeroCardControlsGlobalProvider>
  );
};
