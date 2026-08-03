import React, { CSSProperties, MutableRefObject, useState } from 'react';

import { cn } from '@re/ui-kit/utils/cn';

import { Attachment } from '../../../types';
import { Modal, ModalContent } from '../../ui/modal';
import { BaseImage } from './base-image';
import { ModalGallery } from './modal-gallery';

export type GalleryProps = {
  images: (Attachment & { previewUrl?: string; style?: CSSProperties })[];
  innerRefs?: MutableRefObject<(HTMLElement | null)[]>;
};

const UnMemoizedGallery = (props: GalleryProps) => {
  const { images, innerRefs } = props;

  const [index, setIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const imageFallbackTitle = 'Загруженное изображение';

  const countImagesDisplayedInPreview = 4;
  const lastImageIndexInPreview = countImagesDisplayedInPreview - 1;

  const toggleModal = (selectedIndex: number) => {
    if (modalOpen) {
      setModalOpen(false);
    } else {
      setIndex(selectedIndex);
      setModalOpen(true);
    }
  };

  const renderImages = images.slice(0, countImagesDisplayedInPreview).map((image, i) =>
    i === lastImageIndexInPreview && images.length > countImagesDisplayedInPreview ? (
      <button
        className="relative h-full min-h-[120px] w-full cursor-pointer overflow-hidden bg-cover bg-center"
        data-testid="gallery-image-last"
        key={`gallery-image-${i}`}
        onClick={() => toggleModal(i)}
        style={{
          backgroundImage: `url(${
            images[lastImageIndexInPreview]?.file || images[lastImageIndexInPreview]?.previewUrl
          })`,
          ...image.style,
        }}
        {...(innerRefs?.current && {
          ref: (r) => {
            innerRefs.current[i] = r;
          },
        })}
      >
        <p className="absolute inset-0 flex items-center justify-center bg-black/50 font-medium text-white">
          ещё {`${images.length - countImagesDisplayedInPreview}`} картинок
        </p>
      </button>
    ) : (
      <button
        className="h-full w-full cursor-pointer overflow-hidden transition-opacity hover:opacity-90"
        data-testid="gallery-image"
        key={`gallery-image-${i}`}
        onClick={() => toggleModal(i)}
      >
        <BaseImage
          alt={imageFallbackTitle}
          src={image.previewUrl || image.file}
          style={image.style}
          title={imageFallbackTitle}
          className="h-full w-full object-cover"
          {...(innerRefs?.current && {
            ref: (r) => {
              innerRefs.current[i] = r;
            },
          })}
        />
      </button>
    )
  );

  const className = cn('grid gap-0.5 p-0.5 rounded-lg overflow-hidden max-w-[600px]', {
    'grid-cols-1': images.length === 1,
    'grid-cols-2': images.length === 2 || images.length === 4,
    'grid-cols-3': images.length === 3,
    'grid-rows-2 max-h-[400px]': images.length > 2,
    'grid-cols-2 grid-rows-2': images.length === 4 || images.length > 4,
  });

  return (
    <div className={className}>
      {renderImages}
      <Modal open={modalOpen} onOpenChange={() => setModalOpen((modalOpen) => !modalOpen)}>
        <ModalContent>
          <ModalGallery images={images} index={index} />
        </ModalContent>
      </Modal>
    </div>
  );
};

/**
 * Displays images in a simple responsive grid with a light box to view the images.
 */
export const Gallery = React.memo(UnMemoizedGallery) as typeof UnMemoizedGallery;
