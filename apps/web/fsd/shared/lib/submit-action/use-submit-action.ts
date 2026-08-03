import type { ReactNode } from 'react';

import { create } from 'zustand';

import type { ButtonProps } from '@re/ui-kit/ui/button';

export interface ConfirmationParams {
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
  closeText?: ReactNode;
  confirmText?: ReactNode;
  closeVariant?: ButtonProps['variant'];
  confirmVariant?: ButtonProps['variant'];
  body?: ReactNode;
}

export type ConfirmModalParams = ConfirmationParams & {
  onConfirm: () => void;
  onClose: () => void;
};

interface ConfirmationState {
  params?: ConfirmModalParams;
  getConfirmation: (params?: ConfirmationParams) => Promise<boolean>;
  closeConfirmation: () => void;
}

export const defaultConfirmationParams: Omit<ConfirmModalParams, 'onConfirm' | 'onClose'> = {
  title: 'Подтвердите действие',
  description: 'Вы уверены, что хотите продолжить?',
  closeText: 'Отмена',
  confirmText: 'Подтвердить',
  closeVariant: 'destructive',
  confirmVariant: 'default',
  body: null,
};

export const useConfirmationStore = create<ConfirmationState>((set) => ({
  params: undefined,
  getConfirmation: (params?: ConfirmationParams) =>
    new Promise<boolean>((res) => {
      set({
        params: {
          ...defaultConfirmationParams,
          ...params,
          onConfirm: () => {
            set({ params: undefined });
            res(true);
          },
          onClose: () => {
            set({ params: undefined });
            res(false);
          },
        },
      });
    }),
  closeConfirmation: () => {
    set({ params: undefined });
  },
}));
export const closeConfirmation = useConfirmationStore.getState().closeConfirmation;
export const useGetConfirmation = () => useConfirmationStore((state) => state.getConfirmation);
export const useConfirmedAsyncAction = (
  resolve: () => Promise<unknown>,
  params?: ConfirmationParams,
  reject?: () => Promise<unknown>
) => {
  const getConfirmation = useGetConfirmation();
  return async () => {
    const confirmed = await getConfirmation(params);
    if (confirmed) await resolve();
    else await reject?.();
  };
};

export const continueEqualsNegativeProps = {
  closeVariant: 'default',
  confirmVariant: 'destructive',
} satisfies Pick<ConfirmationParams, 'confirmVariant' | 'closeVariant'>;
export const continueEqualsPositiveProps = {
  closeVariant: 'destructive',
  confirmVariant: 'default',
} satisfies Pick<ConfirmationParams, 'confirmVariant' | 'closeVariant'>;
