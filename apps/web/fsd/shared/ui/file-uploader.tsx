'use client';

import * as React from 'react';
import {
  type DropzoneOptions,
  type DropzoneState,
  type FileRejection,
  useDropzone,
} from 'react-dropzone';
import Image from 'next/image';

import Download from '@re/ui-kit/icons/download';
import { Button } from '@re/ui-kit/ui/button';
import { Progress } from '@re/ui-kit/ui/progress';
import { cn } from '@re/ui-kit/utils/cn';
import { cva } from 'class-variance-authority';

import { useControllableState } from '~shared/hooks/use-controllable-state';
import { Input } from '~shared/ui/input';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { formatBytes } from '~shared/utils/format-bytes';

export interface FileUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Value of the uploader.
   * @[type] File[]
   * @default undefined
   * @example value={files}
   */
  value?: File[];

  /**
   * Function to be called when the value changes.
   * @[type] React.Dispatch<React.SetStateAction<File[]>>
   * @default undefined
   * @example onValueChange={(files) => setFiles(files)}
   */
  onValueChange?: (files: File[]) => void;

  /**
   * Function to be called when files are uploaded.
   * @[type] (files: File[]) => Promise<void>
   * @default undefined
   * @example onUpload={(files) => uploadFiles(files)}
   */
  onUpload?: (files: File[]) => Promise<void>;

  /**
   * Progress of the uploaded files.
   * @[type] Record<string, number> | undefined
   * @default undefined
   * @example progresses={{ "file1.png": 50 }}
   */
  progresses?: Record<string, number>;

  /**
   * Options for the dropzone.
   * @[type] DropzoneOptions | undefined
   * @default undefined
   * @example opts={{ maxFiles: 3, multiple: true }}
   */
  opts?: DropzoneOptions;
}

interface FileUploaderContextProps extends DropzoneState {
  files: File[];
  maxFiles: number;
  maxSize: number;
  setFiles: (files: File[]) => void;
  onRemove: (index: number) => void;
  progresses?: Record<string, number>;
  disabled: boolean;
  accept: string | string[];
}

const FileUploaderContext = React.createContext<FileUploaderContextProps | null>(null);

function useFileUploader() {
  const context = React.useContext(FileUploaderContext);

  if (!context) {
    throw new Error('useFileUploader must be used within a <FileUploader />');
  }

  return context;
}

function isFileWithPreview(file: File): file is File & { preview: string } {
  if (!file) return false;
  return 'preview' in file && typeof file.preview === 'string';
}

export const SUPPORTED_FORMATS_IMAGES = ['.jpg', '.jpeg', '.png', '.gif'];
export const SUPPORTED_FORMATS_ARCHIVES = ['.zip', '.rar'];
export const SUPPORTED_FORMATS_DOCS = ['.doc', '.docx', '.txt', '.fb2', '.rtf'];
const DEFAULT_SUPPORTED_FORMATS = SUPPORTED_FORMATS_IMAGES;

const FileUploader = ({
  ref,
  value: valueProp,
  onValueChange,
  onUpload,
  progresses,
  opts,
  children,
  className,
  ...props
}: FileUploaderProps & {
  ref?: React.RefObject<HTMLDivElement>;
}) => {
  const {
    accept = DEFAULT_SUPPORTED_FORMATS,
    maxSize = 1024 * 1024 * 4,
    maxFiles = 1,
    multiple = false,
    disabled = false,
    ...dropzoneProps
  } = opts ?? {};

  const [files, setFiles] = useControllableState({
    prop: valueProp,
    onChange: onValueChange,
  });

  const onDrop = React.useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      const toast = await importToastAsync();

      if (!multiple && maxFiles === 1 && acceptedFiles.length > 1) {
        toast.error('Cannot upload more than 1 file at a time');
        return;
      }

      if ((files?.length ?? 0) + acceptedFiles.length > maxFiles) {
        toast.error(`Cannot upload more than ${maxFiles} files`);
        return;
      }

      const newFiles = acceptedFiles.map((file) => {
        if (!file.type.startsWith('image')) {
          return file;
        }
        return Object.assign(file, {
          preview: URL.createObjectURL(file),
        });
      });

      const updatedFiles = files ? [...files, ...newFiles] : newFiles;

      setFiles(updatedFiles);

      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file }) => {
          toast.error(`Файл ${file.name} был отклонен`);
        });
      }

      if (onUpload && updatedFiles.length > 0 && updatedFiles.length <= maxFiles) {
        const target = updatedFiles.length > 0 ? `${updatedFiles.length} files` : `file`;

        toast.promise(onUpload(updatedFiles), {
          loading: `Uploading ${target}...`,
          success: () => {
            setFiles([]);
            return `${target} uploaded`;
          },
          error: `Failed to upload ${target}`,
        });
      }
    },

    [files, maxFiles, multiple, onUpload, setFiles]
  );

  function onRemove(index: number) {
    if (!files) return;
    setFiles(() => []);

    if (Array.isArray(files)) {
      const newFiles = files.filter((_, i) => i !== index).filter(Boolean);
      setFiles(newFiles);
      onValueChange?.(newFiles);
    }
  }

  React.useEffect(
    () => () => {
      if (!files) return;
      files.forEach((file) => {
        if (isFileWithPreview(file)) {
          URL.revokeObjectURL(file.preview);
        }
      });
    },

    []
  );
  const isDisabled = disabled || (files?.length ?? 0) >= maxFiles;
  const dropzone = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
    multiple,
    disabled: isDisabled,
    ...dropzoneProps,
  });

  return (
    <FileUploaderContext.Provider
      value={{
        files: files ?? [],
        maxFiles,
        accept,
        maxSize,
        setFiles,
        onRemove,
        progresses,
        disabled: isDisabled,
        ...dropzone,
      }}
    >
      <div
        ref={ref}
        className={cn('relative flex flex-col gap-6 overflow-hidden', className)}
        {...props}
      >
        {children}
      </div>
    </FileUploaderContext.Provider>
  );
};
FileUploader.displayName = 'FileUploader';

const FileUploaderContent = ({
  ref,
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  ref?: React.RefObject<HTMLDivElement>;
}) => (
  <div ref={ref} className={cn(className)} {...props}>
    {children}
  </div>
);
FileUploaderContent.displayName = 'FileUploaderContent';

const fileUploaderInputVariants = cva(
  'group relative cursor-pointer focus-visible:outline-hidden data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  {
    variants: {
      variant: {
        default:
          'grid size-full place-items-center rounded-sm border-2 border-dashed border-muted-foreground/25 px-4 py-2.5 text-center ring-offset-background transition hover:bg-muted/25 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=active]:border-muted-foreground/50',
        button:
          'inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90',
        headless: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface FileUploaderTriggerProps extends React.ComponentProps<'div'> {
  variant?: 'default' | 'button' | 'headless';
  simple?: boolean;
}

const FileUploaderTrigger = ({
  ref,
  children,
  className,
  variant = 'default',
  simple = false,
  ...props
}: FileUploaderTriggerProps) => {
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    maxFiles,
    maxSize,
    disabled,
    accept,
  } = useFileUploader();

  return (
    <div
      ref={ref}
      data-state={
        isDragActive ? 'active' : isDragAccept ? 'accept' : isDragReject ? 'reject' : undefined
      }
      data-disabled={disabled ? '' : undefined}
      className={cn(fileUploaderInputVariants({ variant, className }))}
      {...props}
      {...getRootProps()}
    >
      <Input type="file" {...getInputProps({ className: 'hidden' })} />
      {!simple &&
        (isDragActive ? (
          <div className="flex flex-col items-center justify-center gap-4 sm:px-4">
            <div className="rounded-full border border-dashed p-3">
              <Download size={20} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">Перетащите файл в область</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
            <div className="rounded-full border border-dashed p-3">
              <Download size={20} className="text-muted-foreground" />
            </div>
            <div className="space-y-px">
              <p className="text-muted-foreground font-medium">
                Перестащите файл в область или нажмите, чтобы выбрать
              </p>
              <p className="text-muted-foreground/70 text-sm">
                Вы можете загрузить
                {maxFiles > 1
                  ? ` ${maxFiles === Infinity ? 'сколько угодно' : maxFiles}
                      файлов (до ${formatBytes(maxSize)} каждый)`
                  : ` файл до ${formatBytes(maxSize)}`}
              </p>
              <p>({Array.isArray(accept) ? accept.join(', ') : accept})</p>
            </div>
          </div>
        ))}
      {children}
    </div>
  );
};
FileUploaderTrigger.displayName = 'FileUploaderTrigger';

interface FileUploaderItemProps extends React.HTMLAttributes<HTMLDivElement> {
  file: File | string;
  index: number;
  disabled?: boolean;
  progress?: number;
}

const FileUploaderItem = ({
  ref,
  file,
  index,
  progress,
  className,
  disabled,
  ...props
}: FileUploaderItemProps & {
  ref?: React.RefObject<HTMLDivElement>;
}) => {
  const { onRemove } = useFileUploader();
  if (!file) return null;
  const isFile = typeof file !== 'string';
  return (
    <div
      ref={ref}
      className={cn('relative flex items-center justify-between px-1', className)}
      {...props}
    >
      <div className="flex space-x-4">
        {typeof file === 'string' || isFileWithPreview(file) ? (
          <Image
            src={isFile ? file?.preview : file}
            alt={isFile ? file.name : ''}
            width={48}
            height={48}
            loading="lazy"
            className="aspect-square shrink-0 rounded-xs object-cover"
          />
        ) : null}
        {isFile && (
          <div className="flex w-full flex-col gap-2">
            <div className="space-y-px">
              <p className="text-foreground/80 line-clamp-1 text-sm font-medium">{file.name}</p>
              <p className="text-muted-foreground text-xs">{formatBytes(file.size)}</p>
            </div>
            {progress ? <Progress value={progress} /> : null}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          disabled={disabled}
          className="px-4"
          size="lg"
          type="button"
          variant="outline"
          onClick={() => {
            onRemove(index);
          }}
        >
          {/*<Cross2Icon className="size-4" aria-hidden="true" />*/}
          Удалить
          <span className="sr-only">Удалить файл</span>
        </Button>
      </div>
    </div>
  );
};
FileUploaderItem.displayName = 'FileUploaderItem';

export { FileUploader, FileUploaderContent, FileUploaderItem, FileUploaderTrigger };
