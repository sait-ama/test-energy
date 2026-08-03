'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';

import { ReText } from '@re/ui-kit/ui/text';

import { NoteService, NoteStorage } from '~features/notes/model/services';
import { useCurrentPageSuspenseTitleDetail } from '~pages/(title)/title-detail/model/queries';
import { Expandable } from '~shared/ui/expandable';
import { Section, SectionContent, SectionTitle } from '~shared/ui/section';
import { isEmpty } from '~shared/utils/is-empty';

const EditNoteDialog = dynamic(
  () =>
    import('./edit-note-dialog').then((m) => ({
      default: m.EditNoteDialog,
    })),
  { ssr: false }
);

export const TitleNote = () => {
  const { data } = useCurrentPageSuspenseTitleDetail();
  const { note } = data ?? {};
  const noteStorage = useMemo(() => new NoteStorage(note), [note]);
  const noteService = new NoteService(noteStorage);
  const mainNote = noteService.getMainNote();
  const chaptersNotes = noteService.getAllChapterNotes();

  if (!mainNote?.note && isEmpty(chaptersNotes)) return null;

  return (
    <Section className="bg-secondary dark:bg-background/50 gap-3 border-none">
      <SectionTitle aside={<EditNoteDialog />}>Заметка</SectionTitle>
      <SectionContent>
        <Expandable
          maxHeight={112}
          renderContent={(containerRef) => (
            <div ref={containerRef}>
              {mainNote?.note ? (
                <>
                  <ReText size="sm" color="muted-foreground">
                    Основная заметка:
                  </ReText>
                  {mainNote.note}
                </>
              ) : null}
              {!isEmpty(chaptersNotes) ? (
                <>
                  <ReText size="sm" color="muted-foreground">
                    Заметки к главам:
                  </ReText>
                  {Object.values(chaptersNotes).map((it) => (
                    <div key={it.chapterId}>
                      {it.label}: {it.note}
                    </div>
                  ))}
                </>
              ) : null}
            </div>
          )}
        />
      </SectionContent>
    </Section>
  );
};
