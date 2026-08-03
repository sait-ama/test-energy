'use client';

import { useTheme } from 'next-themes';

import DarkTheme from '@re/ui-kit/icons/dark-theme';
import LightTheme from '@re/ui-kit/icons/light-theme';
import { Checkbox } from '@re/ui-kit/ui/checkbox';
import { RadioGroup, RadioGroupInputItem } from '@re/ui-kit/ui/radio-group';

import { AppereanceValidator } from '~features/change-appereance-settings/model/validator';
import { useBeforeUnloadAlert } from '~shared/hooks/use-before-unloaded';
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

export const UserProfileAppereance = () => {
  const form = useForm({ schema: AppereanceValidator });
  const { setTheme, resolvedTheme } = useTheme();

  const {
    formState: { dirtyFields, isSubmitSuccessful },
  } = form;

  const haveUnsavedChanges = Object.keys(dirtyFields).length !== 0 && !isSubmitSuccessful;

  useBeforeUnloadAlert(haveUnsavedChanges);

  return (
    <Form {...form}>
      <form className="space-y-8">
        <FormField
          control={form.control}
          name="theme"
          render={() => (
            <FormItem>
              <FormLabel>Тема</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={setTheme}
                  defaultValue={resolvedTheme}
                  className="flex flex-row justify-center gap-3 md:justify-start"
                >
                  {[
                    { id: 'light', name: 'Белая', Icon: LightTheme },
                    { id: 'dark', name: 'Темная', Icon: DarkTheme },
                    // { id: 'old', name: 'Олдскул', Icon: DarkTheme },
                  ].map((it) => (
                    <FormItem key={it.id}>
                      <FormLabel
                        className="flex cursor-pointer flex-col items-center gap-4"
                        htmlFor={it.id}
                      >
                        <it.Icon style={{ height: 120, width: 160 }} />
                        <FormControl>
                          <div className="flex w-full items-center justify-center gap-2 md:justify-start">
                            <RadioGroupInputItem value={it.id} id={it.id} />

                            {it.name}
                          </div>
                        </FormControl>
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="show_comments"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-3">
                <FormControl>
                  <Checkbox disabled onChange={field.onChange} value={field.value} />
                </FormControl>
                <div>
                  <FormLabel>Отображать комментарии? (скоро)</FormLabel>
                  <FormDescription>
                    Не будем показывать комментарии под тайтлом, главой.
                  </FormDescription>
                  <FormMessage />
                </div>
              </div>
            </FormItem>
          )}
        />
        {/*<FormField*/}
        {/*    control={form.control}*/}
        {/*    name="theme"*/}
        {/*    render={({ field }) => (*/}
        {/*        <FormItem>*/}
        {/*            <FormLabel>Отображение по умолчанию</FormLabel>*/}
        {/*            <FormControl>*/}
        {/*                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">*/}
        {/*                    {[*/}
        {/*                        { id: 'vertical', name: 'Компактное (вертикальные карточки)' },*/}
        {/*                        { id: 'horizontal', name: 'Информативное (горизонтальные карточки)' },*/}
        {/*                    ].map((it) => (*/}
        {/*                        <FormItem key={it.id} className="flex items-center space-x-3 space-y-0">*/}
        {/*                            <FormControl>*/}
        {/*                                <RadioGroupItem value={it.id} />*/}
        {/*                            </FormControl>*/}
        {/*                            <FormLabel className="font-normal">{it.name}</FormLabel>*/}
        {/*                        </FormItem>*/}
        {/*                    ))}*/}
        {/*                </RadioGroup>*/}
        {/*            </FormControl>*/}
        {/*            <FormMessage />*/}
        {/*        </FormItem>*/}
        {/*    )}*/}
        {/*/>*/}
        {/*<Button type="submit" disabled={!haveUnsavedChanges}>*/}
        {/*    Сохранить изменения*/}
        {/*</Button>*/}
      </form>
    </Form>
  );
};
