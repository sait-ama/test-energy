'use client';

import * as React from 'react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import Close from '@re/ui-kit/icons/close';
import Trash from '@re/ui-kit/icons/trash';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';
import { Textarea } from '@re/ui-kit/ui/textarea';
import { cn } from '@re/ui-kit/utils/cn';

import { useChapter } from '~entities/chapter/model/queries';
import { useNoteStore, useReader, useReaderSettings } from '~entities/reader/model/store';
import { useCreateNote } from '~entities/title/model/mutations';
import { AsyncNoteManager, NoteService, NoteStorage } from '~features/notes/model/services';
import { useCurrentPageSuspenseTitleDetail } from '~pages/(title)/title-detail/model/queries';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { importToastAsync } from '~shared/ui/toast/toast.async';

export const CreateNoteInReader = () => {
  const { data } = useCurrentPageSuspenseTitleDetail();
  const { note } = data ?? {};
  const activeChapterId = useReader((v) => v.activeChapterId);
  const { data: chapter } = useChapter({
    variables: { params: { chapter: String(activeChapterId) } },
  });
  const { isOpen, setIsOpen } = useNoteStore();

  const noteStorage = useMemo(() => new NoteStorage(note), [note]);
  const noteService = new NoteService(noteStorage);
  const asyncNoteManager = new AsyncNoteManager(noteService);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { note: noteService.getChapterNoteById(activeChapterId)?.note || '' },
  });

  const { mutateAsync } = useCreateNote({ params: { titleId: data?.id } });

  const handleMutate = async (formData: { note: string }) => {
    const toast = await importToastAsync();
    try {
      const preparedData = asyncNoteManager.updateNotePrepare(
        {
          main: noteService.getMainNote()?.note,
          chapters: { [activeChapterId]: formData.note },
        },
        `Том ${chapter?.tome}, глава ${chapter?.chapter}`
      );
      await mutateAsync({ note: preparedData });
      toast.success('Заметка главы обновлена');
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  const handleDelete = async () => {
    const toast = await importToastAsync();

    try {
      const preparedData = asyncNoteManager.removeNoteByIdPrepare(activeChapterId);
      await mutateAsync({ note: preparedData });
      reset({ note: '' });
      toast.success('Заметка удалена');
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  return isOpen ? (
    <div className="border-muted bg-secondary relative z-50 mx-4 flex w-[90%] flex-col gap-4 rounded-md border p-4 sm:p-6 md:fixed md:bottom-2 md:left-1/2 md:max-w-screen-sm md:-translate-x-1/2">
      <Button
        className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3"
        circle
        color="secondary"
      >
        <Close onClickCapture={() => setIsOpen(false)} />
      </Button>
      <div className="flex items-center">
        <ReText weight="semibold">Создать заметку</ReText>

        <div className="mr-4 ml-auto flex gap-2">
          <Button onClick={handleSubmit(handleMutate)}>Сохранить</Button>
          <Button circle variant="destructive" onClick={handleDelete}>
            <Trash />
          </Button>
        </div>
      </div>

      <Textarea
        {...register('note')}
        className="max-h-20"
        defaultValue={noteService.getChapterNoteById(activeChapterId)?.note || ''}
      />
    </div>
  ) : (
    <NoteInReader />
  );
};

export const NoteInReader = () => {
  const { data } = useCurrentPageSuspenseTitleDetail();
  const { note } = data ?? {};
  const activeChapterId = useReader((v) => v.activeChapterId);
  const { notes } = useReaderSettings((v) => v.value.manga);

  const [isClose, setIsClose] = useState(false);

  const noteStorage = useMemo(() => new NoteStorage(note), [note]);
  const noteService = new NoteService(noteStorage);

  const chapterNote = noteService.getChapterNoteById(activeChapterId);

  if (!chapterNote?.note || isClose || !notes) return null;

  return (
    <div className="border-muted bg-background relative z-50 mx-4 flex w-[90%] flex-col gap-4 rounded-sm border p-4 sm:p-6 md:fixed md:bottom-2 md:left-1/2 md:max-w-screen-sm md:-translate-x-1/2">
      <div className="absolute top-2 right-2 z-10 rounded-full sm:top-0 sm:right-0 sm:translate-x-1/2 sm:-translate-y-1/2">
        <Button
          color="secondary"
          onClick={() => setIsClose((prev) => !prev)}
          circle
          className={cn(
            'rounded-full'
            //backdrop-blur-[3px]
          )}
        >
          <Close className="size-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-1">
        <ReText className="font-semibold">Заметка</ReText>
        <div className="line-clamp-6 w-full text-wrap">
          <ReText color="muted-foreground" size="sm" className="break-words">
            {chapterNote?.note}
          </ReText>
        </div>
      </div>
    </div>
  );
};
