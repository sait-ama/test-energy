'use client';

import { TitleNote } from '~features/notes/ui/title-note';
import { useLogged } from '~shared/lib/session/use-logged';

export const NotesSection = () => {
  const isLogged = useLogged();

  if (!isLogged) return null;

  return <TitleNote />;
};
