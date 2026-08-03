import { create } from 'zustand';

export const useLikeAppereance = create<{ liked: boolean; startAnimation: () => void }>((set) => ({
  liked: false,
  startAnimation: () => {
    set(() => {
      setTimeout(() => {
        set({ liked: false });
      }, 1000);

      return { liked: true };
    });
  },
}));
