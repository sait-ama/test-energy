'use client';

import type {
  Dispatch,
  MouseEvent,
  MutableRefObject,
  ReactNode,
  RefObject,
  SetStateAction,
  SyntheticEvent,
} from 'react';
import React, { forwardRef, useRef, useState } from 'react';
import ReactCrop, { centerCrop, type Crop, makeAspectCrop, type PixelCrop } from 'react-image-crop';

import { createContextSelector } from '@re/core/utils/create-context-selector';
import type { ButtonProps } from '@re/ui-kit/ui/button';
import { Button } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

import 'react-image-crop/dist/ReactCrop.css';

export function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 50,
        height: 50,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

const getCroppedImg = (image: HTMLImageElement, crop: PixelCrop): string => {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = crop.width * scaleX;
  canvas.height = crop.height * scaleY;

  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.imageSmoothingEnabled = false;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );
  }

  return canvas.toDataURL('image/png', 1.0);
};

export interface ImageEditorStateInput {
  onImageChange: (value: string) => void;
  onCropChange?: (percentCrop: Crop) => void;
  image: string;
  aspect: number | null;
}

export interface ImageEditorState extends ImageEditorStateInput {
  crop: Crop;
  setCrop: Dispatch<SetStateAction<Crop>>;
  imgRef: RefObject<HTMLImageElement>;
  setImageUrl: Dispatch<SetStateAction<string>>;
  imageUrl: string;
}

const { Provider: ImageEditorProvider, useStore: useImageEditorState } = createContextSelector<
  ImageEditorState,
  ImageEditorStateInput
>((opts) => {
  const [crop, setCrop] = useState<Crop>();
  const [imageUrl, setImageUrl] = useState('');

  const imgRef = useRef<HTMLImageElement>(null);

  return { imgRef, crop, imageUrl, setImageUrl, setCrop, ...opts };
});

interface ImageEditorRootProps extends ImageEditorStateInput {
  children: ReactNode;
  className?: string;
}

export const ImageEditorRoot = forwardRef<HTMLDivElement, ImageEditorRootProps>((props, ref) => {
  const { children, onImageChange, onCropChange, image, aspect = 1, className } = props;

  return (
    <ImageEditorProvider
      value={{
        onImageChange,
        image,
        aspect,
        onCropChange,
      }}
    >
      <div className={cn('flex flex-col items-center gap-4', className)} ref={ref}>
        {children}
      </div>
    </ImageEditorProvider>
  );
});

interface ImageEditorAreaItemProps {
  ref: MutableRefObject<HTMLImageElement>;
  onLoad: React.ReactEventHandler<HTMLImageElement>;
  src: string;
}

export interface ImageEditorAreaProps {
  children: (props: ImageEditorAreaItemProps) => ReactNode;
}

export const ImageEditorArea = (props: ImageEditorAreaProps) => {
  const { children } = props;
  const { crop, image, setCrop, onCropChange, setImageUrl, aspect, imgRef } = useImageEditorState(
    (v) => v
  );

  const onImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  };

  function onCropComplete(crop: PixelCrop) {
    if (imgRef.current && crop.width && crop.height) {
      const croppedImageUrl = getCroppedImg(imgRef.current, crop);
      setImageUrl(croppedImageUrl);
    }
  }

  return (
    <ReactCrop
      crop={crop}
      onChange={(_, percentCrop) => {
        setCrop(percentCrop);
        onCropChange?.(percentCrop);
      }}
      onComplete={onCropComplete}
      aspect={aspect}
      className="w-full"
    >
      {children({ ref: imgRef, onLoad: onImageLoad, src: image })}
    </ReactCrop>
  );
};

interface ImageEditorActionsProps {
  className?: string;
  children: ReactNode;
}

export const ImageEditorActionsContainer = (props: ImageEditorActionsProps) => {
  const { className, children } = props;

  return (
    <div className={cn('flex w-full items-center justify-end gap-2', className)}>{children}</div>
  );
};

interface ImageEditorSubmitProps extends Omit<ButtonProps, 'children'> {}

export const ImageEditorSubmit = (props: ImageEditorSubmitProps) => {
  const { onClick, ...rest } = props;
  const { onImageChange, imageUrl } = useImageEditorState((v) => v);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);

    onImageChange(imageUrl);
  };

  return (
    <Button onClick={handleClick} {...rest}>
      Сохранить
    </Button>
  );
};

interface ImageEditorCancelProps extends Omit<ButtonProps, 'children'> {}

export const ImageEditorCancel = (props: ImageEditorCancelProps) => (
  <Button color="secondary" {...props}>
    Отменить
  </Button>
);
