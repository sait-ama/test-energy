import { Attachment } from '../../../types';

export type AttachmentLoadingState = 'uploading' | 'finished' | 'failed';

export enum LinkPreviewState {
  /** Link preview has been dismissed using MessageInputContextValue.dismissLinkPreview **/
  DISMISSED = 'dismissed',
  /** Link preview could not be loaded, the enrichment request has failed. **/
  FAILED = 'failed',
  /** Link preview has been successfully loaded. **/
  LOADED = 'loaded',
  /** The enrichment query is in progress for a given link. **/
  LOADING = 'loading',
  /** The link is scheduled for enrichment. **/
  QUEUED = 'queued',
}

export type LinkURL = string;

export type LinkPreview = {
  state: LinkPreviewState;
};

export enum SetLinkPreviewMode {
  UPSERT,
  SET,
  REMOVE,
}

export type LinkPreviewMap = Map<LinkURL, LinkPreview>;

type FileAttachment = Attachment & {
  type: 'file';
  asset_url?: string;
  file_size?: number;
  mime_type?: string;
  title?: string;
};

type ImageAttachment = Attachment & {
  type: 'image';
  fallback?: string;
  image_url?: string;
  original_height?: number;
  original_width?: number;
};

export type BaseLocalAttachmentMetadata = {
  id: number;
  file?: File;
};

export type LocalAttachmentUploadMetadata = {
  file?: File;
  uploadState?: AttachmentLoadingState;
};

export type LocalImageAttachmentUploadMetadata = LocalAttachmentUploadMetadata & {
  previewUri?: string;
};

export type LocalAttachmentCast<A, L = Record<string, unknown>> = A & {
  localMetadata: L & BaseLocalAttachmentMetadata;
};

export type LocalAttachmentMetadata<CustomLocalMetadata = Record<string, unknown>> =
  CustomLocalMetadata & BaseLocalAttachmentMetadata & LocalImageAttachmentUploadMetadata;

export type LocalImageAttachment = LocalAttachmentCast<ImageAttachment>;

export type LocalFileAttachment = LocalAttachmentCast<FileAttachment>;

export type AnyLocalAttachment = LocalAttachmentCast<Partial<Attachment>>;

export type LocalAttachment = AnyLocalAttachment;

export type LocalAttachmentToUpload<CustomLocalMetadata = Record<string, unknown>> =
  Partial<Attachment> & {
    localMetadata: Partial<BaseLocalAttachmentMetadata> &
      LocalAttachmentUploadMetadata &
      CustomLocalMetadata;
  };
