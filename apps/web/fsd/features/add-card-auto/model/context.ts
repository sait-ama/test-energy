import { useState } from 'react';
import { Crop } from 'react-image-crop';

import { createContext } from '@re/core/utils/create-context';

import { CharacterSchema } from '~shared/api/models/character';

export const { useStore: useAutoCardForm, Provider: AutoCardFormProvider } = createContext(() => {
  const [character, setCharacter] = useState<CharacterSchema | null>(null);
  const [crop, setCrop] = useState<Crop | null>(null);

  return {
    crop,
    setCrop,
    character,
    setCharacter,
  };
});
