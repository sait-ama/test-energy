import React, { lazy, Suspense, useState } from 'react';
import { useTheme } from 'next-themes';

import i18n from '@emoji-mart/data/i18n/ru.json';

import { HoverCard, HoverCardPrimitive } from '@re/ui-kit/ui/hover-card';
import { Skeleton } from '@re/ui-kit/ui/skeleton';

import { useMessageInputContext } from '../../../context';
import { EmojiPickerTrigger } from './emoji-picker-trigger';
import { EmojiPickerIcon } from './icons';

export type EmojiPickerProps = {
  ButtonIconComponent?: React.ComponentType;
  buttonClassName?: string;
  pickerContainerClassName?: string;
  wrapperClassName?: string;
  closeOnEmojiSelect?: boolean;
};

const classNames: EmojiPickerProps = {
  buttonClassName: '',
  pickerContainerClassName:
    'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 rounded-md outline-hidden overflow-hidden',
  wrapperClassName: '',
};

const Picker = lazy(() => import('@emoji-mart/react'));

export const EmojiPicker = (props: EmojiPickerProps) => {
  const { theme } = useTheme();
  const { insertText, textareaRef } = useMessageInputContext('EmojiPicker');
  const [displayPicker, setDisplayPicker] = useState(false);

  const { buttonClassName, pickerContainerClassName, wrapperClassName } = classNames;
  const { ButtonIconComponent = EmojiPickerIcon } = props;

  return (
    <div className={props.wrapperClassName ?? wrapperClassName}>
      <HoverCard openDelay={100} open={displayPicker} onOpenChange={setDisplayPicker}>
        <EmojiPickerTrigger
          ButtonIconComponent={ButtonIconComponent}
          buttonClassName={buttonClassName}
        />
        <HoverCardPrimitive.Content
          hideWhenDetached
          align="start"
          className={pickerContainerClassName}
        >
          <Suspense fallback={<Skeleton className="max-h-[320px] min-w-[280px]" />}>
            {displayPicker && (
              <Picker
                i18n={i18n}
                // emojiSize={18}
                theme={theme}
                previewPosition="none"
                skinTonePosition="none"
                data={async () => (await import('@emoji-mart/data')).default}
                onEmojiSelect={(e: { native: string }) => {
                  insertText(e.native);
                  textareaRef.current?.focus();
                  if (props.closeOnEmojiSelect) {
                    setDisplayPicker(false);
                  }
                }}
              />
            )}
          </Suspense>
        </HoverCardPrimitive.Content>
      </HoverCard>
    </div>
  );
};
