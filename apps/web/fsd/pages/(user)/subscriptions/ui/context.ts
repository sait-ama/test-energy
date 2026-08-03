import { create } from 'zustand';

export interface State {
  touched: boolean;
  touchesIndexes: Set<number>;
}
export interface Actions {
  choose: (index: number) => void;
  reset: () => void;
}
export const useSubscriptionsMultiChoose = create<State & Actions>((set) => ({
  touchesIndexes: new Set<number>(),
  touched: false,
  choose: (index) => {
    set((prev) => {
      const hasTouched = prev.touchesIndexes.has(index);
      const indexes = prev.touchesIndexes;
      if (hasTouched) indexes.delete(index);
      else indexes.add(index);
      return {
        ...prev,
        touchesIndexes: new Set(indexes),
        touched: indexes.size >= 1,
      };
    });
  },
  reset: () => {
    set((prev) => ({ ...prev, touched: false, touchesIndexes: new Set<number>() }));
  },
}));
