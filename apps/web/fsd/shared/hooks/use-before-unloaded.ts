import { useCallback, useEffect } from 'react';

const defaultMessage = 'У вас имеется незаполненная информация, вы точно хотите совершить переход?';

type BooleanOrFunc = boolean | (() => boolean);
//todo onBeforeSideEffect
// export const useBeforeUnload = (enabled: BooleanOrFunc = true, onEnabled?: () => void) => {
//     const handler = useCallback(
//         (event: BeforeUnloadEvent) => {
//             const resolvedEnabled = typeof enabled === 'function' ? enabled() : true;
//             if (resolvedEnabled) {
//                 event.preventDefault();
//                 onEnabled?.();
//             }
//         },
//         [enabled, onEnabled]
//     );
//
//     useEffect(() => {
//         if (!(typeof enabled === 'function' ? enabled() : true)) return;
//
//         window.addEventListener('beforeunload', handler);
//
//         return () => {
//             window.removeEventListener('beforeunload', handler);
//         };
//     }, [enabled, handler]);
// };
export const useBeforeUnloadAlert = (
  enabled: BooleanOrFunc = true,
  message: string = defaultMessage
) => {
  const handler = useCallback(
    (event: BeforeUnloadEvent) => {
      //todo for  dynamic rerenders
      if (process.env.NODE_ENV === 'development') return;
      const resolvedEnabled = typeof enabled === 'function' ? enabled() : true;

      if (!resolvedEnabled) return;

      event.preventDefault();
      confirm(message);

      return message;
    },
    [enabled, message]
  );

  useEffect(() => {
    if (!(typeof enabled === 'function' ? enabled() : true)) return;

    window.addEventListener('beforeunload', handler);

    return () => {
      window.removeEventListener('beforeunload', handler);
    };
  }, [enabled, handler]);
};
