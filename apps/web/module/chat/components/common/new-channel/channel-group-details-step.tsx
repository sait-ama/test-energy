import { memo } from 'react';

import { z } from 'zod';

import ArrowLeft from '@re/ui-kit/icons/arrow-left';
import GroupOfPersons from '@re/ui-kit/icons/group-of-persons';
import Trash from '@re/ui-kit/icons/trash';
import { Button } from '@re/ui-kit/ui/button';
import { ScrollArea } from '@re/ui-kit/ui/scroll-area';
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

import { useNewChannelGroupContext } from '../../../context/new-channel-group-context';
import { UserListItem } from '../user-item/user-list-item';

// Define Zod schema for form validation
const channelGroupFormSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Название беседы должно содержать минимум 3 символа' })
    .max(30, { message: 'Название беседы не должно превышать 30 символов' }),
  image: z.instanceof(File).optional(),
});

// Define the form values type
type ChannelGroupFormValues = z.infer<typeof channelGroupFormSchema>;

type ChannelGroupDetailsStepProps = {
  className?: string;
  onBack: () => void;
};

const ChannelGroupDetailsStep = memo(({ className, onBack }: ChannelGroupDetailsStepProps) => {
  const {
    selectedUsers,
    channelGroupName,
    setChannelGroupName,
    channelGroupImage,
    setChannelGroupImage,
    createChannelGroup,
    isCreating,
  } = useNewChannelGroupContext('ChannelGroupDetailsStep');

  const form = useForm({
    schema: channelGroupFormSchema,
    defaultValues: {
      name: channelGroupName || '',
    },
  });

  const onSubmit = async (data: ChannelGroupFormValues) => {
    setChannelGroupName(data.name);
    setChannelGroupImage(data.image || null);
    await createChannelGroup({
      name: data.name,
      cover: data.image,
    });
  };

  return (
    <div className={cn('flex h-full flex-col', className)}>
      <div className="flex items-center gap-2 p-4">
        <Button variant="ghost" circle onClick={onBack}>
          <ArrowLeft size={20} />
        </Button>
        <div className="text-lg font-semibold">Создать группу</div>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex h-full flex-col items-center space-y-4 px-4 py-4"
        >
          <FormField
            control={form.control}
            name="image"
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
                    if (value instanceof File) {
                      field.onChange(value);
                    } else if (typeof value === 'string' && value.startsWith('data:')) {
                      const file = base64ToFile(value, 'image.jpg', 'image/jpeg');
                      field.onChange(file);
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

          <div className="w-full flex-1 space-y-2 overflow-y-auto rounded-md p-2">
            <div className="text-md font-semibold">Участники</div>
            <ScrollArea className="-mx-2">
              {selectedUsers.map((user) => (
                <UserListItem key={user.id} entity={user} />
              ))}
            </ScrollArea>
          </div>
        </form>
        <Button onClick={form.handleSubmit(onSubmit)} className="w-full" disabled={isCreating}>
          {isCreating ? 'Создание...' : 'Создать беседу'}
        </Button>
      </Form>
    </div>
  );
});

ChannelGroupDetailsStep.displayName = 'ChannelGroupDetailsStep';

export { ChannelGroupDetailsStep };
