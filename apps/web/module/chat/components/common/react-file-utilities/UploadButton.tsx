import React, { ComponentProps, forwardRef, useCallback, useMemo } from 'react';

import { nanoid } from 'nanoid';

import { cn } from '@re/ui-kit/utils/cn';

import { useChannelStateContext, useMessageInputContext } from '../../../context';
import { PartialSelected } from '../../../types/types';
import { useHandleFileChangeWrapper } from './utils';

export type FileInputProps = {
  onFileChange: (files: Array<File>) => void;
  resetOnChange?: boolean;
} & Omit<ComponentProps<'input'>, 'type' | 'onChange'>;

export const FileInput = forwardRef(function UploadButton(
  { onFileChange, resetOnChange = true, ...rest }: FileInputProps,
  ref: React.ForwardedRef<HTMLInputElement>
) {
  const handleInputChange = useHandleFileChangeWrapper(resetOnChange, onFileChange);

  return <input onChange={handleInputChange} ref={ref} type="file" {...rest} />;
});

export const UploadFileInput = forwardRef(function UploadFileInput(
  {
    className,
    onFileChange: onFileChangeCustom,
    ...props
  }: PartialSelected<FileInputProps, 'onFileChange'>,
  ref: React.ForwardedRef<HTMLInputElement>
) {
  const { acceptedFiles = [], multipleUploads } = useChannelStateContext('UploadFileInput');
  const { isUploadEnabled, maxFilesLeft, uploadNewFiles } =
    useMessageInputContext('UploadFileInput');

  const id = useMemo(() => nanoid(), []);

  const onFileChange = useCallback(
    (files: Array<File>) => {
      uploadNewFiles(files);
      onFileChangeCustom?.(files);
    },
    [onFileChangeCustom, uploadNewFiles]
  );

  return (
    <FileInput
      accept={acceptedFiles?.join(',')}
      aria-label="File upload"
      data-testid="file-input"
      disabled={!isUploadEnabled || maxFilesLeft === 0}
      id={id}
      multiple={multipleUploads}
      {...props}
      className={cn('hidden', className)}
      onFileChange={onFileChange}
      ref={ref}
    />
  );
});
