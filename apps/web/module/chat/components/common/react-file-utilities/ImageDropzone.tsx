import React, { PropsWithChildren, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';

import { cn } from '@re/ui-kit/utils/cn';

export type ImageDropzoneProps = {
  /**
   * Set accepted file types. See https://github.com/okonet/attr-accept for more information. Keep in mind that mime type determination is not reliable across platforms. CSV files, for example, are reported as text/plain under macOS but as application/vnd.ms-excel under Windows. In some cases there might not be a mime type set at all.
   *
   * One of type: `string, string[]`
   */
  accept?: string | string[];
  /** Enable/disable the dropzone */
  disabled?: boolean;
  handleFiles?: (files: FileList | File[]) => void;
  maxNumberOfFiles?: number;
  /** Allow drag 'n' drop (or selection from the file dialog) of multiple files */
  multiple?: boolean;
};

export const ImageDropzone = ({
  accept: acceptedFiles = [],
  children,
  disabled,
  handleFiles,
  maxNumberOfFiles,
  multiple,
}: PropsWithChildren<ImageDropzoneProps>) => {
  const handleDrop = useCallback(
    (accepted: File[]) => {
      if (!handleFiles) {
        return;
      }

      if (accepted && accepted.length) {
        handleFiles(accepted);
      }
    },
    [handleFiles]
  );

  const accept = useMemo(() =>
    // (typeof acceptedFiles === 'string' ? acceptedFiles.split(',') : acceptedFiles).reduce<
    //     Record<string, Array<string>>
    // >((mediaTypeMap, mediaType) => {
    //     mediaTypeMap[mediaType] ??= [];
    //     return mediaTypeMap;
    // }, {}),
    {}, [acceptedFiles]);

  const { getRootProps, isDragAccept, isDragReject } = useDropzone({
    accept,
    disabled,
    maxFiles: maxNumberOfFiles,
    multiple,
    noClick: true,
    onDrop: handleDrop,
  });

  return (
    <div
      {...getRootProps({
        className: cn('flex h-full flex-col w-full items-center justify-center'),
        style: { position: 'relative' },
      })}
      tabIndex={-1}
    >
      <div
        className={cn(
          'absolute top-0 left-0 -z-10 flex h-full w-full items-center justify-center bg-black/50 opacity-0 transition-opacity duration-200',
          {
            'z-10 flex opacity-100': isDragAccept,
            'hidden opacity-0': isDragReject,
          }
        )}
      >
        <div className="bg-red bg-background border-primary/90 z-10 flex flex-col items-center justify-center rounded-xl border border-dashed p-8">
          <p>Бросай сюда свою картинку! 😶️️</p>
        </div>
      </div>
      {children}
    </div>
  );
};
