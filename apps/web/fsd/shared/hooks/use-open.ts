import { useCallback, useState } from 'react';

export const useOpen = (
  initialValue = false,
  canOpen = true,
  onFailOpen: VoidFunction = () => null
) => {
  const [open, setOpen] = useState<boolean>(initialValue);

  const toggle = useCallback(() => {
    if (canOpen) {
      setOpen((v) => !v);
      return;
    }

    onFailOpen();
  }, [canOpen]);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  return [open, toggle, close] as const;
};
