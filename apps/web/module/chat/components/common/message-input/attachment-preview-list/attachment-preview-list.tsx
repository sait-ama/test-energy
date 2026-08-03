import React from 'react';

import { useMessageInputContext } from '../../../../context';
import { isLocalImageAttachment } from '../../attachment';
import { ImageAttachmentPreview } from './image-attachment-preview';

export type AttachmentPreviewListProps = {};

export const AttachmentPreviewList = (props: AttachmentPreviewListProps) => {
  const { attachments, removeAttachments, uploadAttachment } =
    useMessageInputContext('AttachmentPreviewList');

  return (
    <div className="border-accent rounded-md rounded-b-none border-1 border-b-0 p-2">
      <div className="flex flex-row gap-2" data-testid="attachment-list-scroll-container">
        {attachments.map((attachment) => {
          if (isLocalImageAttachment(attachment)) {
            return (
              <ImageAttachmentPreview
                attachment={attachment}
                handleRetry={uploadAttachment}
                key={attachment.localMetadata.id || attachment.image_url}
                removeAttachments={(args) => {
                  removeAttachments(args);
                }}
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};
