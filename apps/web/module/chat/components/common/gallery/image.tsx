import React, { CSSProperties, MutableRefObject, useState } from 'react';

import { UrlFormatter } from '~shared/utils/url-formatter';

import { Attachment, Dimensions } from '../../../types';
import { ModalContent } from '../../ui/modal';
import { Modal } from '../../ui/modal';
import { BaseImage } from './base-image';
import { ModalGallery } from './modal-gallery';

export type ImageProps = {
  dimensions?: Dimensions;
  innerRef?: MutableRefObject<HTMLImageElement | null>;
  previewUrl?: string;
  style?: CSSProperties;
} & (
  | {
      /** The text fallback for the image */
      fallback?: string;
      /** The full size image url */
      image_url?: string;
      /** The thumb url */
      thumb_url?: string;
    }
  | Attachment
);

/**
 * A simple component that displays an image.
 */
export const ImageComponent = (props: ImageProps) => {
  const { dimensions = {}, fallback, image_url, innerRef, previewUrl, style } = props;

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const imageSrc = UrlFormatter.media(previewUrl || image_url);

  const toggleModal = () => setModalIsOpen((modalIsOpen) => !modalIsOpen);

  return (
    <>
      <BaseImage
        alt={fallback}
        className="str-chat__message-attachment--img"
        data-testid="image-test"
        onClick={toggleModal}
        src={imageSrc}
        style={style}
        tabIndex={0}
        title={fallback}
        {...dimensions}
        {...(innerRef && { ref: innerRef })}
      />
      <Modal open={modalIsOpen} onOpenChange={toggleModal}>
        <ModalContent>
          <ModalGallery images={[props]} index={0} />
        </ModalContent>
      </Modal>
    </>
  );
};
