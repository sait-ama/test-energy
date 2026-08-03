import { lazy, Suspense } from 'react';

const CreateNoteInReader = lazy(() =>
  import(/* webpackChunkName: "NoteCreator" */ './create-note-in-reader').then((m) => ({
    default: m.CreateNoteInReader,
  }))
);

export const CreateNoteInReaderAsync = () => (
  <Suspense>
    <CreateNoteInReader />
  </Suspense>
);
