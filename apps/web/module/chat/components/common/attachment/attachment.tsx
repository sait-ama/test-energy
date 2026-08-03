import React, { useMemo } from 'react';

import { Attachment as AttachmentType } from '../../../types';
import {
  GalleryContainer,
  ImageContainer,
  UnsupportedAttachmentContainer,
} from './attachment-container';
import { GroupedRenderedAttachment, isUploadedImage } from './utils';

const CONTAINER_MAP = {
  unsupported: UnsupportedAttachmentContainer,
} as const;

export const ATTACHMENT_GROUPS_ORDER = ['gallery', 'image', 'unsupported'] as const;

export type AttachmentProps = {
  attachments: AttachmentType[];
};

export const Attachment = (props: AttachmentProps) => {
  const { attachments } = props;

  const groupedAttachments = useMemo(
    () => renderGroupedAttachments(props),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attachments]
  );

  return (
    <div className="-mt-3 -mr-4 -ml-3" onClick={(e) => e.stopPropagation()}>
      {ATTACHMENT_GROUPS_ORDER.reduce(
        (acc, groupName) => [...acc, ...groupedAttachments[groupName]],
        [] as React.ReactNode[]
      )}
    </div>
  );
};

const renderGroupedAttachments = ({
  attachments,
  ...rest
}: AttachmentProps): GroupedRenderedAttachment => {
  const uploadedImages: AttachmentType[] = attachments.filter((attachment) =>
    isUploadedImage(attachment)
  );

  const containers = attachments
    .filter((attachment) => !isUploadedImage(attachment))
    .reduce<GroupedRenderedAttachment>(
      (typeMap, attachment) => {
        const attachmentType = getAttachmentType(attachment);

        const Container = CONTAINER_MAP[attachmentType];
        typeMap[attachmentType].push(
          <Container
            key={`${attachmentType}-${typeMap[attachmentType].length}`}
            {...rest}
            attachment={attachment}
          />
        );

        return typeMap;
      },
      {
        unsupported: [],
        image: [],
        gallery: [],
      }
    );

  if (uploadedImages.length > 1) {
    containers['gallery'] = [
      <GalleryContainer
        key="gallery-container"
        {...rest}
        attachment={{ images: uploadedImages }}
      />,
    ];
  } else if (uploadedImages.length === 1) {
    containers['image'] = [
      <ImageContainer key="image-container" {...rest} attachment={uploadedImages[0]!} />,
    ];
  }

  return containers;
};

const getAttachmentType = (
  attachment: AttachmentProps['attachments'][number]
): keyof typeof CONTAINER_MAP => {
  return 'unsupported';
};
