import { useCallback, useRef, useState } from 'react';

export const useCooldown = (cooldownMs: number) => {
  const [isCooldown, setIsCooldown] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startCooldown = useCallback(() => {
    setIsCooldown(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsCooldown(false);
    }, cooldownMs);
  }, [cooldownMs]);

  const clearCooldown = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    isCooldown,
    startCooldown,
    clearCooldown,
  };
};
