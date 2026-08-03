import { ChannelSchema } from 'module/chat/model/types';
import { z } from 'zod';

import GroupOfPersons from '@re/ui-kit/icons/group-of-persons';
import Trash from '@re/ui-kit/icons/trash';
import { Button } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

import { Form, FormControl, FormField, FormItem, FormMessage, useForm } from '~shared/ui/form';
import {
  ImageUploadEditorContent,
  ImageUploadEditorCropper,
  ImageUploadEditorRoot,
  ImageUploadEditorTrigger,
  ImageUploadEditorUploader,
} from '~shared/ui/image-upload-editor';
import { Input } from '~shared/ui/input';
import { base64ToFile } from '~shared/utils/base64-to-file';

type ChannelEditFormProps = {
  channel: ChannelSchema;
  onSubmit: (channel: Pick<ChannelSchema, 'name'> & { cover?: File }) => void;
  onCancel: () => void;
  isLoading: boolean;
  className?: string;
};

const channelEditFormSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Название беседы должно содержать минимум 3 символа' })
    .max(30, { message: 'Название беседы не должно превышать 30 символов' }),
  cover: z.union([z.string(), z.instanceof(File)]).optional(),
});

type ChannelEditFormValues = z.infer<typeof channelEditFormSchema>;

export const ChannelEditForm = (props: ChannelEditFormProps) => {
  const { channel, onSubmit: onSubmitProp, onCancel, isLoading, className } = props;

  const form = useForm({
    schema: channelEditFormSchema,
    defaultValues: {
      name: channel.name,
      cover: channel.cover?.[0]?.url ?? '',
    },
  });

  const onSubmit = (data: ChannelEditFormValues) => {
    onSubmitProp({
      name: data.name,
      cover: data.cover instanceof File ? data.cover : undefined,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('flex w-full flex-col items-center space-y-4', className)}
      >
        <FormField
          control={form.control}
          name="cover"
          render={({ field }) => (
            <FormItem>
              <ImageUploadEditorRoot
                canCrop={(file) => !!(file && file.type !== 'image/gif')}
                value={
                  field.value
                    ? field.value instanceof File
                      ? URL.createObjectURL(field.value)
                      : field.value
                    : ''
                }
                onValueChange={(value: File | string) => {
                  console.log(value);
                  if (value instanceof File) {
                    field.onChange(value);
                  } else if (typeof value === 'string' && value.startsWith('data:')) {
                    const file = base64ToFile(value, 'image.jpg', 'image/jpeg');
                    field.onChange(file);
                  } else if (!value) {
                    field.onChange(value);
                  }
                }}
              >
                <ImageUploadEditorTrigger
                  customButtons={({ src, onDelete }) =>
                    src ? (
                      <Button
                        asChild
                        variant="secondary"
                        circle
                        className="bg-destructive absolute top-0 right-0 text-white"
                        // @ts-expect-error
                        onClick={onDelete}
                      >
                        <span>
                          <Trash size={20} />
                        </span>
                      </Button>
                    ) : null
                  }
                >
                  {({ src }) => (
                    <div
                      className={cn(
                        'bg-primary group flex size-32 cursor-pointer items-center justify-center overflow-hidden rounded-full',
                        'border border-gray-500/10 transition-opacity hover:opacity-90'
                      )}
                    >
                      {src ? (
                        <img src={src} alt="Аватар беседы" />
                      ) : (
                        <GroupOfPersons
                          size={40}
                          className="transition-all duration-200 group-hover:scale-110"
                        />
                      )}
                    </div>
                  )}
                </ImageUploadEditorTrigger>
                <ImageUploadEditorContent>
                  <ImageUploadEditorUploader
                    opts={{
                      accept: 'image/*',
                      maxSize: 5 * 1024 * 1024, // 5MB
                    }}
                  />
                  <ImageUploadEditorCropper aspect={1}>
                    {({ src, ref, onLoad }) => (
                      <img src={src} alt="Изображение" ref={ref} onLoad={onLoad} />
                    )}
                  </ImageUploadEditorCropper>
                </ImageUploadEditorContent>
              </ImageUploadEditorRoot>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <Input {...field} placeholder="Введите название беседы" className="w-full" />
              </FormControl>
              <FormMessage className="px-2 pt-2" />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </form>
    </Form>
  );
};
