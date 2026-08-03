'use client';

import type { FC } from 'react';

import ChevronDown from '@re/ui-kit/icons/chevron-down';
import ChevronTop from '@re/ui-kit/icons/chevron-top';
import { Button } from '@re/ui-kit/ui/button';

import { useOpen } from '~shared/hooks/use-open';

interface DetailProps {
  text: string;
  content: string;
}

export const Detail: FC<DetailProps> = ({ text, content }) => {
  const [open, toggle] = useOpen();

  return (
    <details className="mx-4 mt-4 mb-0 flex flex-col items-center justify-center whitespace-pre-wrap">
      <summary
        className="hover:text-primary-light flex cursor-pointer list-none items-center justify-center select-none"
        onClick={toggle}
      >
        {text} {open ? <ChevronDown /> : <ChevronTop />}
      </summary>
      {open ? (
        <div className="flex flex-col gap-4 p-0 px-1 text-center break-words select-text">
          {content.slice(0, 500)}...
          <Button className="self-center" onClick={() => navigator.clipboard.writeText(content)}>
            Скопировать полный текст ошибки
          </Button>
        </div>
      ) : null}
    </details>
  );
};
