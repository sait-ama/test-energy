'use client';

import { z } from 'zod';

import { Button } from '@re/ui-kit/ui/button';
import { Switch } from '@re/ui-kit/ui/switch';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from '~shared/ui/form';
import { Input } from '~shared/ui/input';

export enum BookmarkVisibility {
  VISIBLE = 'show',
  HIDDEN = 'hide',
}

export enum BookmarkNotify {
  SHOW = '1',
  HIDE = '0',
}

export const BookmarkValidator = z.object({
  name: z.string().optional(),
  is_visible: z.nativeEnum(BookmarkVisibility), // '1' '0'
  is_notify: z.nativeEnum(BookmarkNotify), // 'show' 'hide'
});

export type BookmarkFormSchema = z.infer<typeof BookmarkValidator>;

export interface BookmarkFormProps {
  edit?: boolean;
  defaultValues?: Partial<BookmarkFormSchema> & { bookmark_id?: NumberIsomorphic };
  onSubmit: (values: BookmarkFormSchema) => void;
  isPending?: boolean;
}

export const BookmarkForm = (props: BookmarkFormProps) => {
  const { edit = false, defaultValues = {}, onSubmit, isPending = false } = props;
  const form = useForm({
    schema: BookmarkValidator,
    defaultValues: {
      name: defaultValues.name,
      is_visible: defaultValues.is_visible || BookmarkVisibility.HIDDEN,
      is_notify: defaultValues.is_notify || BookmarkNotify.HIDE,
    },
  });

  const formLabel = edit ? 'Изменить закладку' : 'Добавить закладку';

  const handleSubmit = (values) => {
    const resolvedValues = {
      ...values,
    };

    if (edit) {
      resolvedValues.bookmark_id = defaultValues.bookmark_id;
    }

    if (edit && defaultValues.bookmark_id == 1) {
      delete resolvedValues.name;
    }

    onSubmit(resolvedValues);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-5">
        <FormField
          control={form.control}
          name="name"
          disabled={edit && defaultValues.bookmark_id == 1}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Введите название закладки" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_visible"
          render={({ field: { value, onChange, ...rest } }) => (
            <FormItem>
              <div className="flex items-center gap-4">
                <FormControl>
                  <Switch
                    checked={value === BookmarkVisibility.VISIBLE}
                    onCheckedChange={(v) => {
                      onChange(v ? BookmarkVisibility.VISIBLE : BookmarkVisibility.HIDDEN);
                    }}
                    {...rest}
                  />
                </FormControl>
                <FormLabel style={{ marginBottom: 0 }}>Видимость</FormLabel>
              </div>
              <FormDescription>
                Будут ли другие пользователи видеть данную закладку в профиле
              </FormDescription>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_notify"
          render={({ field: { value, onChange, ...rest } }) => (
            <FormItem>
              <div className="flex items-center gap-4">
                <FormControl>
                  <Switch
                    checked={value === BookmarkNotify.SHOW}
                    onCheckedChange={(v) => {
                      onChange(v ? BookmarkNotify.SHOW : BookmarkNotify.HIDE);
                    }}
                    {...rest}
                  />
                </FormControl>
                <FormLabel style={{ marginBottom: 0 }}>Уведомления</FormLabel>
              </div>
              <FormDescription>
                Будут ли приходить уведомления о выходе глав из данной закладки
              </FormDescription>

              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="self-end" disabled={isPending}>
          {formLabel}
        </Button>
      </form>
    </Form>
  );
};
