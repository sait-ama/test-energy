import { useLayoutEffect, useRef } from 'react';

import { UserTheme } from '~shared/api/models/user';

export const useInsertUserThemeStyle = (theme: UserTheme | undefined) => {
  const insertedStyle = useRef<HTMLStyleElement | null>(null);
  const insertedJs = useRef<HTMLScriptElement | null>(null);
  const themeId = theme?.id;

  useLayoutEffect(() => {
    function cleanup() {
      if (insertedStyle.current) {
        document.body.removeChild(insertedStyle.current);
        insertedStyle.current = null;
      }

      if (insertedJs.current) {
        document.body.removeChild(insertedJs.current);
        insertedJs.current = null;
      }
    }

    if (insertedStyle.current || insertedJs.current || !theme) return cleanup;

    const styleTag = document.createElement('style');
    styleTag.innerText = theme.css_code;
    insertedStyle.current = styleTag;
    document.body.appendChild(styleTag);

    if (theme.js_code) {
      const codeTag = document.createElement('script');
      codeTag.innerText = theme.js_code;
      insertedJs.current = codeTag;
      document.body.appendChild(codeTag);
    }

    return cleanup;
  }, [themeId]);
};
