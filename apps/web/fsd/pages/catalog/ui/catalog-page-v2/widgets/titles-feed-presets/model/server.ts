import { cookies } from 'next/headers';

import { CUSTOM_PRESETS_COOKIE_KEY } from './constants';
import { Preset } from './types';

export const getServerCookieCustomPresets = async (): Promise<Preset[]> => {
  const cookieStore = await cookies();
  const customPresets = cookieStore.get(CUSTOM_PRESETS_COOKIE_KEY);

  return customPresets?.value ? JSON.parse(customPresets.value) : [];
};
