import { useMemo } from 'react';

import { cn } from '@re/ui-kit/utils/cn';

import { useMessageInputContext } from '../../../context';
import { ChatAutoComplete } from '../chat-textarea/chat-textarea';
import { EmojiPicker } from '../emoji-picker';
import { AttachmentPreviewList } from './attachment-preview-list';
import { AttachmentSelector } from './attachment-select-button';
import { SendButton } from './send-button';

export const MessageInputCompose = () => {
  const {
    attachments,
    handleSubmit,
    hideSendButton,
    isUploadEnabled,
    maxFilesLeft,
    message,
    numberOfUploads,
    parent,
    text,
    uploadNewFiles,
  } = useMessageInputContext('MessageInputFlat');

  const failedUploadsCount = useMemo(
    () => attachments.filter((a) => a.localMetadata?.uploadState === 'failed').length,
    [attachments]
  );

  const showAttachments =
    isUploadEnabled && !!(numberOfUploads + failedUploadsCount || attachments.length > 0);

  return (
    <>
      <div className="relative w-full px-2 pb-2 md:px-4 md:pb-4">
        {showAttachments && <AttachmentPreviewList />}
        <div
          className={cn(
            'flex w-full items-center justify-between gap-2',
            'border-accent focus-within:border-accent flex min-h-[40px] w-full flex-row items-center gap-2 rounded-md border-1 bg-white px-2 py-2 text-sm dark:bg-[#16181C99]',
            showAttachments && 'rounded-t-none'
          )}
        >
          <EmojiPicker />

          <ChatAutoComplete />

          {isUploadEnabled && <AttachmentSelector />}

          {!hideSendButton && (
            <SendButton
              className="mt-auto"
              disabled={
                !numberOfUploads && !text.length && attachments.length - failedUploadsCount === 0
              }
              sendMessage={handleSubmit}
            />
          )}
        </div>
      </div>
    </>
  );
};
