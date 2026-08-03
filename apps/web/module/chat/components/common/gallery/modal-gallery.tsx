import React, { useMemo } from 'react';
import ImageGallery, { ReactImageGalleryItem } from 'react-image-gallery';

import { UrlFormatter } from '~shared/utils/url-formatter';

import { BaseImage } from './base-image';
import { ImageProps } from './image';

export type ModalGalleryProps = {
  /** The images for the Carousel component */
  images: ImageProps[];
  /** The index for the component */
  index?: number;
};

const onError: React.ReactEventHandler<HTMLImageElement> = (e) => {
  // Prevent having alt attribute on img as the img takes the height of the alt text
  // instead of the CSS / element width & height when the CSS mask (fallback) is applied.
  (e.target as HTMLImageElement).alt = '';
};

const renderItem = ({ original, originalAlt }: ReactImageGalleryItem) => (
  <BaseImage alt={originalAlt} className="image-gallery-image" onError={onError} src={original} />
);

export const ModalGallery = (props: ModalGalleryProps) => {
  const { images, index } = props;

  const formattedArray = useMemo(
    () =>
      images.map((image) => {
        const imageSrc = UrlFormatter.media(image.image_url || image.file || image.previewUrl);
        return {
          original: imageSrc,
          originalAlt: '',
          source: imageSrc,
        };
      }),
    [images]
  );

  return (
    <ImageGallery
      items={formattedArray}
      renderItem={renderItem}
      showIndex
      showPlayButton={false}
      showThumbnails={false}
      startIndex={index}
    />
  );
};
