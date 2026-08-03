import { useEffect } from 'react';
import type {
  AppRouterInstance,
  NavigateOptions,
} from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useSearchParams } from 'next/navigation';

import { useRouter } from '@bprogress/next';

export const saveScroll = () =>
  window.localStorage.setItem('persistentScroll', window.scrollY.toString());
export const removeScroll = () => window.localStorage.removeItem('persistentScroll');

export const useScrollRestorationRouter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const persistentScroll = window.localStorage.getItem('persistentScroll')!;

    if (persistentScroll === null || persistentScroll === undefined) return;

    window.scrollTo({ top: Number(persistentScroll) });

    if (Number(persistentScroll) === window.scrollY) removeScroll();

    return () => {
      removeScroll();
    };
  }, [searchParams]);

  return {
    ...router,
    push: (href: string, options?: NavigateOptions) => {
      saveScroll();
      router.push(href, options);
    },
    replace: (href: string, options?: NavigateOptions) => {
      saveScroll();
      router.push(href, options);
    },
  } satisfies AppRouterInstance;
};
