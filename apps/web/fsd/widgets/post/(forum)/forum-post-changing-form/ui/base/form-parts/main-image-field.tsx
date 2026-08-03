'use client';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';

import { ImageAttachment } from '~entities/post/ui/post-attachment';
import Title from '~shared/assets/placeholders/title';
import { FormField, FormLabel } from '~shared/ui/form';
import {
  ImageUploadEditorContent,
  ImageUploadEditorCropper,
  ImageUploadEditorRoot,
  ImageUploadEditorTrigger,
  ImageUploadEditorUploader,
} from '~shared/ui/image-upload-editor';

export interface FormMainImageFieldProps {
  className?: string;
}

export const FormMainImageField = (props: FormMainImageFieldProps) => {
  const { className } = props;

  const tForm = useTranslations('form');

  const { control } = useFormContext();

  return (
    <FormField
      name="attachment"
      control={control}
      render={({ field }) => (
        <ImageUploadEditorRoot
          className={className}
          canCrop={() => false}
          value={field.value || ''}
          onValueChange={(e) => {
            field.onChange(typeof e !== 'string' ? undefined : e);
          }}
        >
          <FormLabel>{tForm('placeholders.image')}</FormLabel>

          <ImageUploadEditorTrigger className="border-border w-full rounded-md border">
            {({ src }) =>
              !src ? (
                <div className="m-auto flex h-[250px] items-center justify-center">
                  <Title size={80} />
                </div>
              ) : (
                <ImageAttachment url={src} />
              )
            }
          </ImageUploadEditorTrigger>
          <ImageUploadEditorContent>
            <ImageUploadEditorUploader
              opts={{
                accept: 'image/*',
                maxSize: 5 * 1024 * 1024,
              }}
            />
            <ImageUploadEditorCropper aspect={1}>
              {({ src, ref, onLoad }) => (
                <img src={src} alt={tForm('placeholders.image')} ref={ref} onLoad={onLoad} />
              )}
            </ImageUploadEditorCropper>
          </ImageUploadEditorContent>
        </ImageUploadEditorRoot>
      )}
    />
  );
};
