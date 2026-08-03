import type { ReactNode } from 'react';

import FaceSmile from '@re/ui-kit/icons/face-smile';
import { Popover, PopoverContent, PopoverTrigger } from '@re/ui-kit/ui/popover';

import { useOpen } from '~shared/hooks/use-open';
import { HandlePickHandler, StickerList } from '~shared/ui/text-editor/emoji-picker/sticker-list';
// import { useMediaQuery } from '@material-ui/core';
// import { breakpoints } from 'lib';

interface StickerPickerProps {
  children?: ReactNode;
  handlePick: HandlePickHandler;
  withoutStickers?: boolean;
}

export const StickerPicker = (props: StickerPickerProps) => {
  const [open, toggle] = useOpen(false);

  const {
    children = <FaceSmile className={`size-5 ${open && 'text-primary'}`} />,
    withoutStickers,
  } = props;
  const isMobile = false;
  // useMediaQuery(breakpoints.down('sm'));
  const Component = /*isMobile ? Drawer :*/ Popover;
  const ComponentTrigger = /*isMobile ? DrawerTrigger :*/ PopoverTrigger;
  const ComponentContent = /*isMobile ? DrawerContent : */ PopoverContent;

  return (
    <Component onOpenChange={toggle}>
      <ComponentTrigger>{children}</ComponentTrigger>
      <ComponentContent
        /*hideOverlay={false}*/ alignOffset={40}
        className={`${!isMobile && 'w-[380px]'} p-2 py-1.5`}
        align="center"
      >
        {/*<EmojiListV2 asParent />*/}
        <StickerList withoutStickers={withoutStickers} handlePick={props.handlePick} asParent />
      </ComponentContent>
    </Component>
  );
};
