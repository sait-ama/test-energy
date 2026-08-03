'use client';

import type { FC } from 'react';

import { useRouter } from '@bprogress/next';

import type { ButtonProps } from '@re/ui-kit/ui/button';
import { Button } from '@re/ui-kit/ui/button';

export const PrevPageButton: FC<ButtonProps> = (props) => {
  const router = useRouter();

  const handleClick = () => {
    router.back();
  };

  return (
    <Button {...props} onClick={handleClick} variant="flat" color="default">
      Вернуться назад
    </Button>
  );
};
