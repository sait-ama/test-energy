'use client';

import { CSSProperties, FC, Suspense } from 'react';

import { useRouter } from '@bprogress/next';

import { Button } from '@re/ui-kit/ui/button';

interface ReloadButtonProps {
  onReload?: () => void;
  style?: CSSProperties;
}

export const ReloadButtonComponent: FC<ReloadButtonProps> = (props) => {
  const { onReload, ...rest } = props;
  const router = useRouter();

  const handleClick = () => {
    if (onReload) {
      onReload();
      return;
    }
    router.refresh();
  };

  return (
    <Button color="secondary" {...rest} onClick={handleClick}>
      Перезагрузить
    </Button>
  );
};

export const ReloadButton: FC<ReloadButtonProps> = (props) => {
  return (
    <Suspense>
      <ReloadButtonComponent {...props} />
    </Suspense>
  );
};
