import type { ReactNode } from 'react';

import { Slot } from '@re/ui-kit/ui/slot';

import { useMomentCreator, useScreenshoter } from '~entities/reader/model/store';

interface CreateMomentInReaderTriggerProps {
  children: ReactNode;
}

export const CreateMomentInReaderTrigger = (props: CreateMomentInReaderTriggerProps) => {
  const { children } = props;
  const onScreenshot = useScreenshoter((v) => v.onScreenshot);
  const onValueChange = useMomentCreator((v) => v.setUrl);

  const handleClick = async () => {
    await onScreenshot({
      onSuccess: (value) => {
        onValueChange(value);
      },
    });
  };

  return <Slot onClick={handleClick}>{children}</Slot>;
};
