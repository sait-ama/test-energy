import React, { ElementRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { nanoid } from 'nanoid';

import Add from '@re/ui-kit/icons/add';
import { Dialog, DialogContent } from '@re/ui-kit/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@re/ui-kit/ui/dropdown-menu';

import { useChannelStateContext } from '../../../context';
import {
  AttachmentSelectorContextProvider,
  useAttachmentSelectorContext,
} from '../../../context/attachment-selector-context';
import { UploadFileInput } from '../react-file-utilities';
import { AttachmentIcon } from './icons';

export const SimpleAttachmentSelector = () => {
  const inputRef = useRef<ElementRef<'input'>>(null);
  const [labelElement, setLabelElement] = useState<HTMLLabelElement | null>(null);
  const id = useMemo(() => nanoid(), []);

  useEffect(() => {
    if (!labelElement) return;
    const handleKeyUp = (event: KeyboardEvent) => {
      if (![' ', 'Enter'].includes(event.key) || !inputRef.current) return;
      event.preventDefault();
      inputRef.current.click();
    };
    labelElement.addEventListener('keyup', handleKeyUp);
    return () => {
      labelElement.removeEventListener('keyup', handleKeyUp);
    };
  }, [labelElement]);

  return (
    <div className="flex flex-col items-center">
      <UploadFileInput id={id} ref={inputRef} />
      <label
        className="hover:text-primary cursor-pointer transition-all duration-300"
        htmlFor={id}
        ref={setLabelElement}
        tabIndex={0}
      >
        <AttachmentIcon />
      </label>
    </div>
  );
};

export type AttachmentSelectorModalContentProps = {
  close: () => void;
};

export type AttachmentSelectorActionProps = {
  openModalForAction: (actionType: AttachmentSelectorAction['type']) => void;
};

export type AttachmentSelectorAction = {
  ActionButton: React.ComponentType<AttachmentSelectorActionProps>;
  type: 'uploadFile' | 'createPoll' | (string & {});
  ModalContent?: React.ComponentType<AttachmentSelectorModalContentProps>;
};

export const DefaultAttachmentSelectorComponents = {
  File(props: AttachmentSelectorActionProps) {
    const { fileInput } = useAttachmentSelectorContext();

    return (
      <DropdownMenuItem
        onClick={() => {
          if (fileInput) fileInput.click();
        }}
      >
        Картинка
      </DropdownMenuItem>
    );
  },
};

export const defaultAttachmentSelectorActionSet: AttachmentSelectorAction[] = [
  { ActionButton: DefaultAttachmentSelectorComponents.File, type: 'uploadFile' },
];

export type AttachmentSelectorProps = {
  attachmentSelectorActionSet?: AttachmentSelectorAction[];
  getModalPortalDestination?: () => HTMLElement | null;
};

const useAttachmentSelectorActionsFiltered = (original: AttachmentSelectorAction[]) => {
  const { channelCapabilities } = useChannelStateContext();

  return original.filter((action) => {
    if (action.type === 'uploadFile' && !channelCapabilities['upload-file']) return false;
    return true;
  });
};

export const AttachmentSelector = ({
  attachmentSelectorActionSet = defaultAttachmentSelectorActionSet,
}: AttachmentSelectorProps) => {
  const { channelCapabilities } = useChannelStateContext();

  const actions = useAttachmentSelectorActionsFiltered(attachmentSelectorActionSet);

  const [modalContentAction, setModalContentActionAction] = useState<AttachmentSelectorAction>();
  const openModal = useCallback(
    (actionType: AttachmentSelectorAction['type']) => {
      const action = actions.find((a) => a.type === actionType);
      if (!action?.ModalContent) return;
      setModalContentActionAction(action);
    },
    [actions]
  );

  const closeModal = useCallback(() => setModalContentActionAction(undefined), []);

  const [fileInput, setFileInput] = useState<HTMLInputElement | null>(null);

  if (actions.length === 0) return null;

  if (actions.length === 1 && actions[0]?.type === 'uploadFile')
    return <SimpleAttachmentSelector />;

  const ModalContent = modalContentAction?.ModalContent;
  const modalIsOpen = !!ModalContent;

  return (
    <AttachmentSelectorContextProvider value={{ fileInput }}>
      <div className="flex items-center">
        {channelCapabilities['upload-file'] && <UploadFileInput ref={setFileInput} />}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Add />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {actions.map(({ ActionButton, type }) => (
              <ActionButton
                key={`attachment-selector-item-${type}`}
                openModalForAction={openModal}
              />
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Dialog open={modalIsOpen} onOpenChange={(state) => !state && closeModal()}>
          <DialogContent>{ModalContent && <ModalContent close={closeModal} />}</DialogContent>
        </Dialog>
      </div>
    </AttachmentSelectorContextProvider>
  );
};
