import React, { useCallback, useState } from 'react';

import Close from '@re/ui-kit/icons/close';
import { cn } from '@re/ui-kit/utils/cn';

import { BaseImage } from '../../gallery';
import { LoadingIndicatorIcon, RetryIcon } from '../icons';
import type { LocalImageAttachment } from '../types';
import type { AttachmentPreviewProps } from './types';

export type ImageAttachmentPreviewProps = AttachmentPreviewProps<LocalImageAttachment>;

export const ImageAttachmentPreview = ({
  attachment,
  handleRetry,
  removeAttachments,
}: ImageAttachmentPreviewProps) => {
  const [previewError, setPreviewError] = useState(false);

  const { id, uploadState } = attachment.localMetadata ?? {};

  const handleLoadError = useCallback(() => setPreviewError(true), []);
  const assetUrl = attachment.image_url || attachment.localMetadata.previewUri;

  console.log('attachment LIST ITEM', uploadState);

  return (
    <div
      className={cn('relative size-16 rounded-sm', {
        'border border-red-500': previewError,
      })}
      data-testid="attachment-preview-image"
    >
      <button
        aria-label="aria/Remove attachment"
        className="border-border bg-background absolute top-0 right-0 z-10 translate-x-1/3 -translate-y-1/3 rounded-sm border-1"
        data-testid="image-preview-item-delete-button"
        // disabled={uploadState === 'uploading'}
        onClick={() => id && removeAttachments([id])}
        // onClick={console.log}
      >
        <Close className="size-4" />
      </button>

      {uploadState === 'failed' && (
        <button
          className="border-border bg-background/30 absolute top-1/2 right-1/2 z-10 translate-x-1/2 -translate-y-1/2 rounded-sm border-1"
          data-testid="image-preview-item-retry-button"
          onClick={() => handleRetry(attachment)}
        >
          <RetryIcon />
        </button>
      )}

      {uploadState === 'uploading' && (
        <div className="absolute top-1/2 right-1/2 z-10 translate-x-1/2 -translate-y-1/2 rounded-sm border-1">
          <LoadingIndicatorIcon size={18} />
        </div>
      )}

      {assetUrl && (
        <BaseImage
          alt={attachment.fallback}
          className="absolute top-0 left-0 size-full rounded-sm object-cover"
          onError={handleLoadError}
          src={assetUrl}
          title={attachment.fallback}
        />
      )}
    </div>
  );
};
