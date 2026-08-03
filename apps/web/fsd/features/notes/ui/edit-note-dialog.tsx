import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form/dist/types/form';

import Edit from '@re/ui-kit/icons/edit';
import Trash from '@re/ui-kit/icons/trash';
import { Badge } from '@re/ui-kit/ui/badge';
import { Button } from '@re/ui-kit/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@re/ui-kit/ui/dialog';
import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@re/ui-kit/ui/tabs';
import { Textarea } from '@re/ui-kit/ui/textarea';

import { useCreateNote } from '~entities/title/model/mutations';
import { AsyncNoteManager, NoteService, NoteStorage } from '~features/notes/model/services';
import { useCurrentPageSuspenseTitleDetail } from '~pages/(title)/title-detail/model/queries';
import { useOpen } from '~shared/hooks/use-open';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { TestProps } from '~shared/lib/test/utils/test-props';
import { EmptyView } from '~shared/ui/empty-view';
import { importToastAsync } from '~shared/ui/toast/toast.async';

export const EditNoteDialog = () => {
  const { data } = useCurrentPageSuspenseTitleDetail();
  const { note } = data ?? {};
  const [open, toggle] = useOpen();

  const [selectedTab, setSelectedTab] = useState('title');
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const { mutateAsync } = useCreateNote({ params: { titleId: data?.id } });

  const noteStorage = useMemo(() => new NoteStorage(note), [note]);
  const noteService = new NoteService(noteStorage);
  const asyncNoteManager = new AsyncNoteManager(noteService);
  const initialNote = noteService.getMainNote() || { main: { note: '' } };

  const { register, handleSubmit: mainSubmit } = useForm({
    defaultValues: { main: initialNote?.main },
  });
  const chapterForm = useForm({
    defaultValues: {
      note: selectedChapterId
        ? noteService.getChapterNoteById(Number(selectedChapterId))?.note || ''
        : '',
    },
  });
  const { handleSubmit: chapterSubmit } = chapterForm;

  const handleMainMutate = async (formData: { main: string }) => {
    const toast = await importToastAsync();
    try {
      const preparedData = asyncNoteManager.updateNotePrepare({ main: formData.main });
      await mutateAsync({ note: preparedData });
      toast.success('Заметка обновлена');
      toggle();
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  const handleChapterMutate = async (formData: { note: string }) => {
    const toast = await importToastAsync();
    try {
      const preparedData = asyncNoteManager.updateNotePrepare({
        main: noteService.getMainNote()?.note,
        // @ts-ignore
        chapters: { [selectedChapterId]: formData.note },
      });
      await mutateAsync({ note: preparedData });
      toast.success('Заметка главы обновлена');
      toggle();
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  const handleDelete = async () => {
    const toast = await importToastAsync();

    try {
      const preparedData = asyncNoteManager.removeMainNotePrepare();
      await mutateAsync({ note: preparedData });
      toast.success('Заметка удалена');
      toggle();
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };
  const handleChapterNoteDelete = async () => {
    const toast = await importToastAsync();

    try {
      const preparedData = asyncNoteManager.removeNoteByIdPrepare(selectedChapterId);
      await mutateAsync({ note: preparedData });
      toast.success('Заметка удалена');
      toggle();
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  const currentSaveHandler =
    selectedTab === 'title' ? mainSubmit(handleMainMutate) : chapterSubmit(handleChapterMutate);
  const currentRemoveHandler = selectedTab === 'title' ? handleDelete : handleChapterNoteDelete;

  const hasMainNote = !!noteStorage.getMainNote()?.note;
  const hasChapterNotes = !!Object.keys(noteService.getAllNotes().chapters).length;

  return (
    <Dialog open={open} onOpenChange={toggle}>
      <DialogTrigger asChild>
        <Button color="secondary" size="sm" {...TestProps.id(`open_note_modal_btn`)} circle>
          <Edit className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-screen-md">
        <DialogTitle>Редактирование заметок</DialogTitle>
        <Tabs onValueChange={setSelectedTab}>
          <div className="flex justify-between">
            <TabsList>
              <TabsTrigger value="title">К тайтлу</TabsTrigger>
              <TabsTrigger value="chapters">К главам</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button
                circle
                onClick={currentRemoveHandler}
                disabled={selectedTab === 'title' ? !hasMainNote : !hasChapterNotes}
                {...TestProps.id(`delete_note_btn`)}
                variant="destructive"
              >
                <Trash />
              </Button>
              <Button onClick={currentSaveHandler} {...TestProps.id(`save_note_btn`)}>
                Сохранить
              </Button>
            </div>
          </div>
          <TabsContent value="title">
            <Textarea {...register('main')} defaultValue={noteService.getMainNote()?.note || ''} />
          </TabsContent>
          <TabsContent value="chapters">
            <ChapterNotes
              selectedChapterId={selectedChapterId}
              form={chapterForm}
              setSelectedChapterId={setSelectedChapterId}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

interface ChapterNotesProps {
  form: UseFormReturn<any>;
  selectedChapterId: string | null;
  setSelectedChapterId: React.Dispatch<React.SetStateAction<string>>;
}

const ChapterNotes = (props: ChapterNotesProps) => {
  'use no memo';

  const { selectedChapterId, setSelectedChapterId, form } = props;
  const { data } = useCurrentPageSuspenseTitleDetail();
  const { note } = data ?? {};
  const noteStorage = useMemo(() => new NoteStorage(note), [note]);
  const noteService = new NoteService(noteStorage);

  const chaptersNotes = Object.entries(noteService.getAllChapterNotes()).map(([key, value]) => ({
    [key]: value,
  }));

  const { register, setValue, watch } = form;

  const currentNote = watch('note');

  const handleChapterSelect = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    const chapterNote = noteService.getChapterNoteById(Number(chapterId));
    setValue('note', chapterNote?.note || '');
  };

  if (!noteService.getAllChapterNotes().length)
    return <EmptyView text="К главам заметок нет, но их можно оставить в читалке" />;

  return (
    <div className="mt-2 flex flex-col gap-2">
      <ScrollArea>
        <div className="mt-2 flex max-w-md gap-2">
          {chaptersNotes?.map((chapterNote) => {
            const [chapterId, { label }] = Object.entries(chapterNote)[0];

            return (
              <Badge
                key={chapterId}
                onClick={() => handleChapterSelect(chapterId)}
                variant={selectedChapterId === chapterId ? 'default' : 'secondary'}
                className="cursor-pointer"
              >
                {label}
              </Badge>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {selectedChapterId && (
        <Textarea
          {...register('note')}
          placeholder="Введите заметку..."
          defaultValue={currentNote}
          // onChange={(e) => setValue('note', e.target.value, { shouldValidate: true })}
        />
      )}
    </div>
  );
};
