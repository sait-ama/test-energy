'use client';
import type { ComponentProps, ReactNode } from 'react';

import type { DialogContentProps, DialogProps } from '@radix-ui/react-dialog';
import { create } from 'zustand';

import { ButtonProps } from '@re/ui-kit/ui/button';

import { InfoModalType } from '~shared/api/models/info-modal';

export type InfoModalOptionsTypes =
  | ({ contentProps: DialogContentProps; rootProps: DialogProps } & {
      type: InfoModalType.ENTRY;
      entryId: NumberIsomorphic;
    })
  | {
      type: InfoModalType.TEXT;
      text: ReactNode;
      title?: ReactNode;
    }
  | {
      type: InfoModalType.CONTENT;
      content: ReactNode;
      title?: ReactNode;
    }
  | {
      type: InfoModalType.CUSTOM;
      content: ReactNode;
      contentProps?: ComponentProps<'div'>; // TODO: it defined not in a good way
      srOnly: string;
      title?: ReactNode;
    }
  | {
      type: InfoModalType.ALERT;
      title: ReactNode;
      onAction?: () => void;
      actionButtonProps?: Omit<ButtonProps, 'onClick'>;
    };

export interface State {
  options: InfoModalOptionsTypes | null;
  isOpen: boolean;
}

export interface Actions {
  open: (options: InfoModalOptionsTypes) => void;
  close: () => void;
}

export const useInfoModal = create<State & Actions>((set) => ({
  isOpen: false,
  options: null,
  open: (options) => {
    switch (options.type) {
      case InfoModalType.ENTRY:
      case InfoModalType.CONTENT:
      case InfoModalType.CUSTOM:
      case InfoModalType.TEXT:
      case InfoModalType.ALERT:
        set((prev) => ({ ...prev, options, isOpen: true }));
        break;
      default:
        break;
    }
  },
  close: () => {
    set(() => ({ isOpen: false }));
  },
}));
