import { useCallback } from 'react';

import { customAlphabet, nanoid } from 'nanoid';

import { useChannelActionContext, useChannelStateContext } from '../../../../context';
import { ChatRepository } from '../../../../model/toolkit/repository';
import { Attachment } from '../../../../types/types';
import { isLocalAttachment, isLocalImageAttachment } from '../../attachment';
import type { FileLike } from '../../react-file-utilities';
import {
  createFileFromBlobs,
  generateFileName,
  isBlobButNotFile,
} from '../../react-file-utilities';
import type { MessageInputProps } from '../message-input';
import type {
  AttachmentLoadingState,
  BaseLocalAttachmentMetadata,
  LocalAttachment,
} from '../types';
import type { MessageInputReducerAction, MessageInputState } from './use-message-input-state';
import { checkUploadPermissions } from './utils';

const apiMaxNumberOfFiles = 10;

// Define a temporary attachment type with all possible properties to fix TS errors
type TempAttachment = {
  id?: number;
  type: string;
  fallback?: string;
  file_size?: number;
  mime_type?: string;
  title?: string;
  image_url?: string;
  asset_url?: string;
  thumb_url?: string;
};

// const isAudioFile = (file: FileLike) => file.type.includes('audio/');
const isImageFile = (file: FileLike) =>
  file.type.startsWith('image/') && !file.type.endsWith('.photoshop'); // photoshop files begin with 'image/'
// const isVideoFile = (file: FileLike) => file.type.includes('video/');

const getAttachmentTypeFromMime = (mimeType: string) => {
  if (mimeType.startsWith('image/') && !mimeType.endsWith('.photoshop')) return 'image';
  if (mimeType.includes('video/')) return 'video';
  return 'file';
};

const ensureIsLocalAttachment = (attachment: Attachment | LocalAttachment): LocalAttachment => {
  if (isLocalAttachment(attachment)) {
    return attachment;
  }

  // Create a local attachment from the regular attachment
  // by ensuring the correct type casting
  const { localMetadata, ...rest } = attachment as any;

  return {
    localMetadata: {
      ...(localMetadata ?? {}),
      id: (localMetadata as BaseLocalAttachmentMetadata)?.id || nanoid(),
    },
    ...rest,
  };
};

function defaultFileUploadRequest(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return ChatRepository.Upload.file({
    data: formData,
  });
}

export const useAttachments = (
  props: MessageInputProps,
  state: MessageInputState,
  dispatch: React.Dispatch<MessageInputReducerAction>,
  textareaRef: React.MutableRefObject<HTMLTextAreaElement | undefined>
) => {
  const { noFiles = true } = props;
  const { addNotification } = useChannelActionContext('useAttachments');
  const { channel, maxNumberOfFiles, multipleUploads } = useChannelStateContext('useAttachments');

  // Number of files that the user can still add. Should never be more than the amount allowed by the API.
  // If multipleUploads is false, we only want to allow a single upload.
  const maxFilesAllowed = !multipleUploads ? 1 : maxNumberOfFiles || apiMaxNumberOfFiles;

  const numberOfUploads = Object.values(state.attachments).filter(
    ({ localMetadata }) => localMetadata.uploadState && localMetadata.uploadState !== 'failed'
  ).length;

  const maxFilesLeft = maxFilesAllowed - numberOfUploads;

  const removeAttachments = useCallback(
    (ids: number[]) => {
      if (!ids.length) return;
      dispatch({ ids, type: 'removeAttachments' });
    },
    [dispatch]
  );

  const upsertAttachments = useCallback(
    (attachments: (Attachment | LocalAttachment)[]) => {
      if (!attachments.length) return;
      dispatch({
        attachments: attachments.map(ensureIsLocalAttachment),
        type: 'upsertAttachments',
      });
    },
    [dispatch]
  );

  const uploadAttachment = useCallback(
    async (att: LocalAttachment): Promise<LocalAttachment | undefined> => {
      const { localMetadata, ...providedAttachmentData } = att;

      if (!localMetadata?.file) return att;

      const { file } = localMetadata;
      const isImage = isImageFile(file);

      if (noFiles && !isImage) return att;

      const canUpload = await checkUploadPermissions({
        addNotification,
        file,
        uploadType: isImage ? 'image' : 'file',
      });

      if (!canUpload) return att;

      localMetadata.id = localMetadata?.id ?? nanoid();

      const finalAttachment: TempAttachment = {
        type: getAttachmentTypeFromMime(file.type),
      };

      if (isImage) {
        localMetadata.previewUri = URL.createObjectURL?.(file);
        if (file instanceof File) {
          finalAttachment.fallback = file.name;
        }
      } else {
        finalAttachment.file_size = file.size;
        finalAttachment.mime_type = file.type;
        if (file instanceof File) {
          finalAttachment.title = file.name;
        }
      }

      Object.assign(finalAttachment, providedAttachmentData);

      upsertAttachments([
        {
          ...finalAttachment,
          localMetadata: {
            ...localMetadata,
            uploadState: 'uploading',
          },
        },
      ]);

      let response: { id: number; file: string; thumb_url?: string };

      try {
        response = await defaultFileUploadRequest(file);
      } catch (error) {
        let finalError: Error = {
          message: 'Error uploading attachment',
          name: 'Error',
        };
        if (typeof (error as Error).message === 'string') {
          finalError = error as Error;
        } else if (typeof error === 'object') {
          finalError = Object.assign(finalError, error);
        }

        addNotification(finalError.message, 'error');

        const failedAttachment: LocalAttachment = {
          ...finalAttachment,
          localMetadata: {
            ...localMetadata,
            uploadState: 'failed' as AttachmentLoadingState,
          },
        };

        upsertAttachments([failedAttachment]);

        return failedAttachment;
      }

      const uploadedAttachment: LocalAttachment = {
        ...finalAttachment,
        localMetadata: {
          ...localMetadata,
          uploadState: 'finished' as AttachmentLoadingState,
        },
      };

      if (isLocalImageAttachment(uploadedAttachment)) {
        if (uploadedAttachment.localMetadata.previewUri) {
          // @ts-ignore
          URL.revokeObjectURL(uploadedAttachment.localMetadata.previewUri);
          delete uploadedAttachment.localMetadata.previewUri;
        }
        uploadedAttachment.id = response.id;
        uploadedAttachment.image_url = response.file;
      } else {
        // Handle as a regular file attachment
        Object.assign(uploadedAttachment, { id: response.id, asset_url: response.file });
      }

      if (response.thumb_url) {
        // Add thumb URL if provided
        Object.assign(uploadedAttachment, { thumb_url: response.thumb_url });
      }

      upsertAttachments([uploadedAttachment]);

      return uploadedAttachment;
    },
    [addNotification, channel, noFiles, removeAttachments, upsertAttachments]
  );

  const uploadNewFiles = useCallback(
    (files: FileList | File[] | FileLike[]) => {
      const filesToBeUploaded = noFiles ? Array.from(files).filter(isImageFile) : Array.from(files);

      filesToBeUploaded.slice(0, maxFilesLeft).forEach((fileLike) => {
        uploadAttachment({
          localMetadata: {
            file: isBlobButNotFile(fileLike)
              ? createFileFromBlobs({
                  blobsArray: [fileLike],
                  fileName: generateFileName(fileLike.type),
                  mimeType: fileLike.type,
                })
              : fileLike,
            id: parseInt(customAlphabet('1234567890', 18)()),
          },
        });
      });

      textareaRef.current?.focus();
    },
    [maxFilesLeft, noFiles, textareaRef, uploadAttachment]
  );

  return {
    maxFilesLeft,
    numberOfUploads,
    removeAttachments,
    uploadAttachment,
    uploadNewFiles,
    upsertAttachments,
  };
};
