import { PropsWithChildren, useRef } from 'react';

import * as linkify from 'linkifyjs';

import { cn } from '@re/ui-kit/utils/cn';

import { Attachment } from '../../../types';
import { Gallery, ImageComponent } from '../gallery';
import { UnsupportedAttachment } from './unsupported-attachment';
import { AttachmentComponentType } from './utils';

export type AttachmentContainerProps = {
  attachment: Attachment | { images: Attachment[] };
  componentType: AttachmentComponentType;
};

export const AttachmentWithinContainer = ({
  children,
  componentType,
}: PropsWithChildren<AttachmentContainerProps>) => {
  const classNames = cn('flex w-full', {
    'gallery-cx max-w-[600px]': componentType === 'gallery',
    'image-cx max-w-[340px]': componentType === 'image',
  });

  return <div className={classNames}>{children}</div>;
};

function getCssDimensionsVariables(url: string) {
  const cssVars = {
    '--original-height': 1000000,
    '--original-width': 1000000,
  } as Record<string, number>;

  if (linkify.test(url, 'url')) {
    const urlParams = new URL(url).searchParams;
    const oh = Number(urlParams.get('oh'));
    const ow = Number(urlParams.get('ow'));
    const originalHeight = oh > 1 ? oh : 1000000;
    const originalWidth = ow > 1 ? ow : 1000000;
    cssVars['--original-width'] = originalWidth;
    cssVars['--original-height'] = originalHeight;
  }

  return cssVars;
}

export const GalleryContainer = ({ attachment }: { attachment: { images: Attachment[] } }) => {
  const imageElements = useRef<HTMLElement[]>([]);

  const images = attachment.images.map((image, i) => ({
    ...image,
    previewUrl: image.url || 'about:blank',
    style: getCssDimensionsVariables(image.url || ''),
  }));

  return (
    <AttachmentWithinContainer attachment={attachment} componentType="gallery">
      <Gallery images={images || []} innerRefs={imageElements} key="gallery" />
    </AttachmentWithinContainer>
  );
};

export const ImageContainer = (props: { attachment: Attachment }) => {
  const { attachment } = props;
  const componentType = 'image';
  const imageElement = useRef<HTMLImageElement>(null);

  const imageConfig = {
    ...attachment,
    previewUrl: attachment?.url || 'about:blank',
    style: getCssDimensionsVariables(attachment.url || ''),
  };

  return (
    <AttachmentWithinContainer attachment={attachment} componentType={componentType}>
      <ImageComponent {...imageConfig} innerRef={imageElement} />
    </AttachmentWithinContainer>
  );
};

export const UnsupportedAttachmentContainer = ({ attachment }: { attachment: Attachment }) => (
  <UnsupportedAttachment attachment={attachment} />
);
