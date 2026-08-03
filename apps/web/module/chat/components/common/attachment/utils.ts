import { ReactNode } from 'react';

import type { AttachmentSchema } from '../../../model/types';
import type { LocalAttachment, LocalImageAttachment } from '../message-input/types';
import { ATTACHMENT_GROUPS_ORDER } from './attachment';

export type GalleryAttachment = {
  images: AttachmentSchema[];
};

export type AttachmentComponentType = (typeof ATTACHMENT_GROUPS_ORDER)[number];

export type GroupedRenderedAttachment = Record<AttachmentComponentType, ReactNode[]>;

export type AttachmentSize = 'thumbnail' | 'original';

const THUMBNAIL_MAX_SIZE = 200;

export const isUploadedImage = (attachment: AttachmentSchema): boolean => {
  return attachment.media_type === 'image';
};

export const isGalleryAttachmentType = (
  output: AttachmentSchema | GalleryAttachment
): output is GalleryAttachment => {
  return 'images' in output && Array.isArray((output as GalleryAttachment).images);
};

export const isSvgAttachment = (attachment: AttachmentSchema): boolean => {
  return attachment.media_type === 'image' && attachment.extension === 'svg';
};

export const isLocalAttachment = (attachment: unknown): attachment is LocalAttachment => {
  return !!(attachment as LocalAttachment)?.localMetadata?.id;
};

export const isLocalImageAttachment = (
  attachment: AttachmentSchema | LocalAttachment
): attachment is LocalImageAttachment => {
  return isUploadedImage(attachment as AttachmentSchema) && isLocalAttachment(attachment);
};

export function findAttachment(
  attachments: AttachmentSchema[],
  size: AttachmentSize = 'original'
): AttachmentSchema | undefined {
  if (!attachments?.length) return undefined;

  if (size === 'original') {
    return attachments.find((attachment) => attachment.is_original);
  }

  return attachments.find((attachment) => {
    const { width, height } = attachment;
    return width <= THUMBNAIL_MAX_SIZE && height <= THUMBNAIL_MAX_SIZE;
  });
}

export function getAttachmentUrl(
  attachments?: AttachmentSchema[],
  size: AttachmentSize = 'original',
  fallbackUrl?: string
): string | undefined {
  if (!attachments) return fallbackUrl;

  return findAttachment(attachments, size)?.url ?? fallbackUrl;
}
