import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export const useOnReroute = (callback: (...args: any) => void) => {
  const pathname = usePathname();

  useEffect(() => {
    callback();
  }, [pathname]);
};
