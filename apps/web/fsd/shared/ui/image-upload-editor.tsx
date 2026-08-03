'use client';
import type { CSSProperties, Dispatch, ReactNode, SetStateAction } from 'react';
import { useState } from 'react';

import { createContextSelector } from '@re/core/utils/create-context-selector';
import { buttonVariants } from '@re/ui-kit/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@re/ui-kit/ui/dialog';
import { cn } from '@re/ui-kit/utils/cn';

import { useBoolean } from '~shared/hooks/use-boolean';
import type { FileUploaderProps } from '~shared/ui/file-uploader';
import { FileUploader, FileUploaderTrigger } from '~shared/ui/file-uploader';
import type { ImageEditorAreaProps, ImageEditorStateInput } from '~shared/ui/image-editor';
import {
  ImageEditorActionsContainer,
  ImageEditorArea,
  ImageEditorCancel,
  ImageEditorRoot,
  ImageEditorSubmit,
} from '~shared/ui/image-editor';
import { fileToBase64 } from '~shared/utils/file-to-base64';
import { mergeFunc } from '~shared/utils/merge-funcs';
import { preventDefault } from '~shared/utils/prevent-default';

interface ImageUploadEditor {
  setOpen: Dispatch<SetStateAction<boolean>>;
  file: File | undefined;
  setFile: Dispatch<SetStateAction<File | undefined>>;
  base64: string | undefined;
  setBase64: Dispatch<SetStateAction<string | undefined>>;
  value: string;
  onValueChange: (value: string, file?: File) => void;
  canCrop: (file: File | undefined) => boolean;
}

const { Provider: ImageUploadEditorProvider, useStore: useImageUploadEditor } =
  createContextSelector<
    ImageUploadEditor,
    Omit<ImageUploadEditor, 'file' | 'setFile' | 'base64' | 'setBase64'>
  >((options) => {
    const [file, setFile] = useState<File | undefined>();
    const [base64, setBase64] = useState<string>();

    return {
      ...options,
      file,
      setFile,
      base64,
      setBase64,
    };
  });

interface ImageUploadEditorRootProps
  extends Omit<ImageUploadEditor, 'setOpen' | 'file' | 'setFile' | 'base64' | 'setBase64'> {
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}

export const ImageUploadEditorRoot = (props: ImageUploadEditorRootProps) => {
  const { children, value, canCrop, onValueChange, ...rest } = props;
  const [open, toggle, setOpen] = useBoolean();

  return (
    <ImageUploadEditorProvider
      value={{
        setOpen,
        onValueChange,
        value,
        canCrop,
      }}
    >
      <div {...rest}>
        <Dialog open={open} onOpenChange={toggle}>
          {children}
        </Dialog>
      </div>
    </ImageUploadEditorProvider>
  );
};

interface ImageUploadEditorTriggerProps {
  children: ({ src }: { src: string }) => ReactNode;
  className?: string;
  customButtons?: (props: { src: string; onDelete: (e: MouseEvent) => void }) => ReactNode;
}

export const ImageUploadEditorTrigger = (props: ImageUploadEditorTriggerProps) => {
  const { children, className, customButtons } = props;
  const src = useImageUploadEditor((v) => v.value);
  const setFile = useImageUploadEditor((v) => v.setFile);
  const onValueChange = useImageUploadEditor((v) => v.onValueChange);
  const setBase64 = useImageUploadEditor((v) => v.setBase64);

  const handleDelete = mergeFunc(preventDefault, () => {
    setFile(undefined);
    onValueChange('');
    setBase64('');
  });

  return (
    <DialogTrigger className={cn('relative flex flex-col items-start', className)}>
      {children({ src })}
      {customButtons ? (
        // @ts-expect-error
        customButtons({ src, onDelete: handleDelete })
      ) : (
        <div className="absolute top-2 right-2 z-[1000] flex flex-col gap-1">
          <span
            className={cn(
              buttonVariants({
                color: 'secondary',
                size: 'sm',
              }),
              'px-3'
            )}
          >
            Изменить
          </span>
          {!!src?.length && (
            <span
              onClick={handleDelete}
              className={cn(
                buttonVariants({
                  variant: 'destructive',
                  size: 'sm',
                }),
                'px-3'
              )}
            >
              Удалить
            </span>
          )}
        </div>
      )}
    </DialogTrigger>
  );
};

interface ImageUploadEditorContentProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export const ImageUploadEditorContent = (props: ImageUploadEditorContentProps) => {
  const { children, className, ...rest } = props;

  return (
    <DialogContent className={cn('sm:max-w-xl', className)} {...rest}>
      {children}
    </DialogContent>
  );
};

export interface ImageUploadEditorUploaderProps
  extends Omit<FileUploaderProps, 'value' | 'onValueChange'> {}

export const ImageUploadEditorUploader = (props: ImageUploadEditorUploaderProps) => {
  const { opts, ...rest } = props;
  const file = useImageUploadEditor((v) => v.file);
  const setFile = useImageUploadEditor((v) => v.setFile);
  const canCrop = useImageUploadEditor((v) => v.canCrop);
  const setBase64 = useImageUploadEditor((v) => v.setBase64);
  const setOpen = useImageUploadEditor((v) => v.setOpen);
  const onValueChange = useImageUploadEditor((v) => v.onValueChange);

  if (file) return null;

  const handleChange = async (file: File) => {
    const b64 = await fileToBase64(file);

    if (!canCrop(file)) {
      onValueChange(b64, file);
      setOpen(false);
      return;
    }

    setFile(file);
    setBase64(b64);
  };

  return (
    <FileUploader
      value={file ? [file] : []}
      onValueChange={(files) => handleChange(files[0])}
      opts={{
        ...opts,
        maxFiles: 1,
      }}
      {...rest}
    >
      <FileUploaderTrigger />
    </FileUploader>
  );
};

export interface ImageUploadEditorCropperProps
  extends ImageEditorAreaProps,
    Pick<ImageEditorStateInput, 'aspect'> {}

export const ImageUploadEditorCropper = (props: ImageUploadEditorCropperProps) => {
  const { children, aspect } = props;
  const file = useImageUploadEditor((v) => v.file);
  const base64 = useImageUploadEditor((v) => v.base64);
  const onValueChange = useImageUploadEditor((v) => v.onValueChange);
  const canCrop = useImageUploadEditor((v) => v.canCrop);
  const setOpen = useImageUploadEditor((v) => v.setOpen);
  const setBase64 = useImageUploadEditor((v) => v.setBase64);
  const setFile = useImageUploadEditor((v) => v.setFile);

  if (!canCrop(file)) return null;

  const handleClose = () => {
    setOpen(false);
  };
  const handleReset = () => {
    handleClose();
    setBase64(undefined);
    setFile(undefined);
  };

  return (
    <ImageEditorRoot image={base64!} onImageChange={onValueChange} aspect={aspect}>
      <ImageEditorArea>{children}</ImageEditorArea>
      <ImageEditorActionsContainer>
        <ImageEditorCancel onClick={handleReset} />
        <ImageEditorSubmit onClick={handleClose} />
      </ImageEditorActionsContainer>
    </ImageEditorRoot>
  );
};
