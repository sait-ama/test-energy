'use client';

import type { ReactNode } from 'react';

import { Slot } from '@re/ui-kit/ui/slot';

import { useNoteStore } from '~entities/reader/model/store';

interface CreateNoteInReaderTriggerProps {
  children: ReactNode;
}

export const CreateNoteInReaderTrigger = (props: CreateNoteInReaderTriggerProps) => {
  const { children } = props;

  const { setIsOpen } = useNoteStore();

  return <Slot onClick={() => setIsOpen((prev) => !prev)}>{children}</Slot>;
};
