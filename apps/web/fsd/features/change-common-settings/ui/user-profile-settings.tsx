'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';

import { Button } from '@re/ui-kit/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@re/ui-kit/ui/popover';
import { RadioGroup, RadioGroupInputItem } from '@re/ui-kit/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@re/ui-kit/ui/select';
import { Separator } from '@re/ui-kit/ui/separator';
import { Switch } from '@re/ui-kit/ui/switch';
import dayjs from 'dayjs';
import pick from 'lodash.pick';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { useUpdateCurrentUser } from '~entities/user/model/mutations';
import { useUserForms, useUserQuery } from '~entities/user/model/queries';
import { UserKeys } from '~entities/user/model/query-keys';
import { UserAvatar } from '~entities/user/ui/user-avatar';
import {
  UserWallpaper,
  UserWallpaperBackground,
  UserWallpaperRoot,
} from '~entities/user/ui/user-wallpaper';
import type { SettingsSchema } from '~features/change-common-settings/model/validator';
import { SettingsValidator } from '~features/change-common-settings/model/validator';
import { getQueryClient } from '~shared/api/react-query';
import Person from '~shared/assets/placeholders/person';
import { useBeforeUnloadAlert } from '~shared/hooks/use-before-unloaded';
import { useErrorHandler } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { useSession } from '~shared/lib/session/use-session';
import type { AppQueryKey } from '~shared/types/react-query';
import { Calendar } from '~shared/ui/calendar';
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
import {
  ImageUploadEditorContent,
  ImageUploadEditorCropper,
  ImageUploadEditorRoot,
  ImageUploadEditorTrigger,
  ImageUploadEditorUploader,
} from '~shared/ui/image-upload-editor';
import { Input } from '~shared/ui/input';
import { importToastAsync } from '~shared/ui/toast/toast.async';

const ToolbarBold = dynamic(
  () =>
    import('~shared/ui/text-editor/toolbar').then((m) => ({
      default: m.ToolbarBold,
    })),
  { ssr: false }
);
const ToolbarItalic = dynamic(
  () =>
    import('~shared/ui/text-editor/toolbar').then((m) => ({
      default: m.ToolbarItalic,
    })),
  { ssr: false }
);
const ToolbarRoot = dynamic(
  () =>
    import('~shared/ui/text-editor/toolbar').then((m) => ({
      default: m.ToolbarRoot,
    })),
  { ssr: false }
);
const ToolbarStrikethrough = dynamic(
  () =>
    import('~shared/ui/text-editor/toolbar').then((m) => ({
      default: m.ToolbarStrikethrough,
    })),
  { ssr: false }
);

const TextEditorContainer = dynamic(
  () =>
    import('~shared/ui/text-editor/text-editor').then((m) => ({
      default: m.TextEditorContainer,
    })),
  { ssr: false }
);
const TextEditorEditableArea = dynamic(
  () =>
    import('~shared/ui/text-editor/text-editor').then((m) => ({
      default: m.TextEditorEditableArea,
    })),
  { ssr: false }
);
const TextEditorRoot = dynamic(
  () =>
    import('~shared/ui/text-editor/text-editor').then((m) => ({
      default: m.TextEditorRoot,
    })),
  { ssr: false }
);
const TextEditorMarkdownPlugin = dynamic(
  () =>
    import('~shared/ui/text-editor/plugins/markdown-plugin').then((m) => ({
      default: m.TextEditorMarkdownPlugin,
    })),
  {
    ssr: false,
  }
);
const TextEditorOnChangePlugin = dynamic(
  () =>
    import('~shared/ui/text-editor/plugins/on-change-plugin').then((m) => ({
      default: m.TextEditorOnChangePlugin,
    })),
  {
    ssr: false,
  }
);
const TextEditorDefaultValuePlugin = dynamic(
  () =>
    import('~shared/ui/text-editor/plugins/default-value-plugin').then((m) => ({
      default: m.TextEditorDefaultValuePlugin,
    })),
  {
    ssr: false,
  }
);

export const UserProfileSettings = () => {
  'use no memo';
  const session = useSession()!;
  const { data: forms } = useUserForms({ get: ['adult', 'sex', 'taglines', 'achievements'] });
  const { data: user } = useUserQuery({ variables: { params: { userId: String(session.id) } } });
  // const { data: user } = useQuery(
  //   v2UsersRetrieveOptions({ path: { user_id: session.id }, client })
  // );

  const form = useForm({
    schema: SettingsValidator,
    defaultValues: {
      username: user?.username,
      description: user?.description,
      adult: user?.adult,
      birthday: session.birthday,
      sex: user?.sex,
      email_not: user?.email_not,
      is_private: user?.is_private,
      app_extended_catalog: user?.app_extended_catalog,
      avatar: user?.avatar?.high,
      wallpaper: user?.wallpaper?.high ?? '',
      is_exchanges_enable: !!user?.is_exchanges_enable,
      is_two_factor_auth: user?.is_two_factor_auth,
      vk_not: user?.vk_not,
      is_notify_bp_tasks: session?.is_notify_bp_tasks,
    },
  });

  const {
    formState: { dirtyFields, isLoading },
    resetField,
  } = form;
  const resolveErrors = useErrorHandler({ form });

  useEffect(() => {
    resetField('is_notify_bp_tasks', { defaultValue: session?.is_notify_bp_tasks });
  }, [session]);

  const { mutateAsync } = useUpdateCurrentUser();
  const dateFormat = useSiteConfig((v) => v.localization.dateFormat);

  const haveChangedFields = Object.keys(dirtyFields).length !== 0;
  const disabled = haveChangedFields && isLoading;

  useBeforeUnloadAlert(haveChangedFields);

  const onSubmit = async (data: SettingsSchema) => {
    const toast = await importToastAsync();
    const queryClient = getQueryClient();
    try {
      const validated = pick(data, Object.keys(dirtyFields));
      await mutateAsync(validated);
      await queryClient.invalidateQueries({
        predicate: ({ queryKey }) => {
          const [uniquePart, variables] = (queryKey ?? []) as AppQueryKey;

          if (uniquePart !== UserKeys.detailById({})[0]) return false;

          return variables?.params?.userId === String(session.id);
        },
      });
      toast.success('Данные успешно обновлены');
    } catch (e: unknown) {
      logger.error(e);
      await resolveErrors(e);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {session.is_premium || session.is_staff ? (
          <FormField
            name="wallpaper"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Фон профиля</FormLabel>
                <ImageUploadEditorRoot
                  canCrop={(file) => !!(file && file.type !== 'image/gif')}
                  value={field.value!}
                  onValueChange={(value) => field.onChange(value || '')}
                >
                  <ImageUploadEditorTrigger className="w-full">
                    {({ src }) => (
                      <UserWallpaperRoot className="h-auto">
                        <UserWallpaperBackground className="relative aspect-video overflow-hidden rounded-sm">
                          {src ? (
                            <UserWallpaper src={src} withMask={false} />
                          ) : (
                            <div className="border-border bg-muted/10 flex size-full items-center justify-center border">
                              <Person size={192} />
                            </div>
                          )}
                        </UserWallpaperBackground>
                      </UserWallpaperRoot>
                    )}
                  </ImageUploadEditorTrigger>
                  <ImageUploadEditorContent>
                    <ImageUploadEditorUploader
                      opts={{
                        accept: 'image/*',
                        maxSize: 5 * 1024 * 1024,
                      }}
                    />
                    <ImageUploadEditorCropper aspect={16 / 9}>
                      {({ src, ref, onLoad }) => (
                        <img src={src} alt="Изображение" ref={ref} onLoad={onLoad} />
                      )}
                    </ImageUploadEditorCropper>
                  </ImageUploadEditorContent>
                </ImageUploadEditorRoot>
              </FormItem>
            )}
          />
        ) : null}
        <FormField
          name="avatar"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Аватарка</FormLabel>
              <ImageUploadEditorRoot
                canCrop={(file) => !!(file && file.type !== 'image/gif')}
                value={field.value!}
                onValueChange={(value) => field.onChange(value || '')}
              >
                <ImageUploadEditorTrigger>
                  {({ src }) => (
                    <UserAvatar
                      withFrameMargin={false}
                      avatarSrc={src}
                      alt="Аватар пользователя"
                      size={256}
                    />
                  )}
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
                      <img src={src} alt="Изображение" ref={ref} onLoad={onLoad} />
                    )}
                  </ImageUploadEditorCropper>
                </ImageUploadEditorContent>
              </ImageUploadEditorRoot>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Никнейм</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Состоит из букв, цифр и символов @/./+/-/_. За недопустимый по правилам ник Вы
                можете получить бан.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {session.clubs?.length ? (
          <FormField
            control={form.control}
            name="main_club"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Основная гильдия</FormLabel>
                <FormControl>
                  <Select
                    defaultValue={String(session?.main_club?.id)}
                    onValueChange={(value) => {
                      field.onChange(value && value !== '-1' ? Number(value) : null);
                    }}
                    value={field.value ? String(field.value) : undefined}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выбрать" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {session.clubs.map((value) => (
                          <SelectItem key={value.id} value={String(value.id)}>
                            {value.name}
                          </SelectItem>
                        ))}
                        <SelectItem key={session.clubs.length + 1} value="-1">
                          Убрать основную гильдию
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>Гильдия, отображаемая в комментариях</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>О себе</FormLabel>
              <FormControl>
                <TextEditorRoot>
                  <TextEditorContainer>
                    <TextEditorEditableArea />
                    <TextEditorMarkdownPlugin />
                    <TextEditorOnChangePlugin onChange={field.onChange} />
                    <TextEditorDefaultValuePlugin defaultValue={field.value} />
                  </TextEditorContainer>
                  <ToolbarRoot>
                    <ToolbarBold />
                    <ToolbarItalic />
                    <ToolbarStrikethrough />
                  </ToolbarRoot>
                </TextEditorRoot>
              </FormControl>
              <FormDescription>Ссылки на сторонние источники запрещены.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="birthday"
          render={({ field }) => (
            <FormItem>
              <FormLabel>День рождения</FormLabel>
              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant="secondary">
                        {field.value ? (
                          dayjs(field.value).format(dateFormat)
                        ) : (
                          <span>Выберите дату</span>
                        )}

                        {/*<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />*/}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Calendar
                      defaultMonth={field.value ? new Date(field.value) : new Date()}
                      captionLayout="dropdown-buttons"
                      mode="single"
                      selected={field.value ? dayjs(field.value).toDate() : undefined}
                      onSelect={(value) => {
                        field.onChange(value ? dayjs(value).format('YYYY-MM-DD') : undefined);
                      }}
                      disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                      initialFocus
                      toYear={dayjs().year()}
                      fromYear={dayjs().year() - 100}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <FormDescription>
                Укажите свой день рождения — в этот день мы подготовим подарок :)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sex"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Пол</FormLabel>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                {forms.content.sex.map((it) => (
                  <FormItem key={it.id} className="flex items-center space-y-0 space-x-3">
                    <FormControl>
                      <RadioGroupInputItem value={it.id} />
                    </FormControl>
                    <FormLabel className="font-normal">{it.name}</FormLabel>
                  </FormItem>
                ))}
              </RadioGroup>
              <FormDescription className="mt-2">
                Поможет нам подбирать наиболее релевантные тайтлы
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="adult"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Эротика (18+)</FormLabel>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                {forms.content.adult?.map((it) => (
                  <FormItem key={it.id} className="flex items-center space-y-0 space-x-3">
                    <FormControl>
                      <RadioGroupInputItem value={it.id} />
                    </FormControl>
                    <FormLabel className="font-normal">{it.name}</FormLabel>
                  </FormItem>
                ))}
              </RadioGroup>
              <FormMessage />
            </FormItem>
          )}
        />
        <Separator />
        <FormField
          control={form.control}
          name="email_not"
          render={({ field: { value, onChange, ...rest } }) => (
            <FormItem>
              <div className="flex items-center gap-4">
                <FormControl>
                  <Switch
                    checked={value}
                    defaultChecked={value}
                    onCheckedChange={onChange}
                    {...rest}
                  />
                </FormControl>
                <FormLabel className="!mb-0">Уведомления на почту</FormLabel>
              </div>
              <FormDescription>
                Отправляем только самое важное. Не чаще одного раза в неделю.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="vk_not"
          render={({ field: { value, onChange, ...rest } }) => (
            <FormItem>
              <div className="flex items-center gap-4">
                <FormControl>
                  <Switch
                    checked={value}
                    defaultChecked={value}
                    onCheckedChange={onChange}
                    {...rest}
                  />
                </FormControl>
                <FormLabel className="!mb-0">Уведомления в ВК</FormLabel>
              </div>
              <FormDescription>
                Будем рассылать уведомления о новых главах еще во ВКонтакте.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tg_not"
          render={({ field: { value, onChange, ...rest } }) => (
            <FormItem>
              <div className="flex items-center gap-4">
                <FormControl>
                  <Switch
                    checked={value}
                    defaultChecked={value}
                    onCheckedChange={onChange}
                    {...rest}
                  />
                </FormControl>
                <FormLabel className="!mb-0">Уведомления в Telegram</FormLabel>
              </div>
              <FormDescription>
                Будем рассылать уведомления о новых главах еще и в Telegram.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_notify_bp_tasks"
          render={({ field: { value, onChange, ...rest } }) => (
            <FormItem>
              <div className="flex items-center gap-4">
                <FormControl>
                  <Switch
                    checked={value}
                    defaultChecked={value}
                    onCheckedChange={onChange}
                    {...rest}
                  />
                </FormControl>
                <FormLabel className="!mb-0">Уведомления о заданиях БП</FormLabel>
              </div>
              <FormDescription>
                Отправим уведомление, если вы выполнили задание в боевом пропуске.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Separator />

        <FormField
          control={form.control}
          name="is_exchanges_enable"
          render={({ field: { value, onChange, ...rest } }) => (
            <FormItem>
              <div className="flex items-center gap-4">
                <FormControl>
                  <Switch checked={value} onCheckedChange={onChange} {...rest} />
                </FormControl>
                <FormLabel className="!mb-0">Разрешать предлагать обмены</FormLabel>
              </div>

              <FormDescription>
                Выключив данную опцию, Вам не смогут предложить обмен карточками.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <FormField
          control={form.control}
          name="is_private"
          render={({ field: { value, onChange, ...rest } }) => (
            <FormItem>
              <div className="flex items-center gap-4">
                <FormControl>
                  <Switch
                    checked={value}
                    defaultChecked={value}
                    onCheckedChange={onChange}
                    {...rest}
                  />
                </FormControl>
                <FormLabel className="!mb-0">Закрытый профиль</FormLabel>
              </div>

              <FormDescription>
                Другие будут видеть только аватар, никнейм и чуть-чуть статистики. Закладки — только
                Ваши.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_two_factor_auth"
          render={({ field: { value, onChange, ...rest } }) => (
            <FormItem>
              <div className="flex items-center gap-4">
                <FormControl>
                  <Switch
                    checked={value}
                    defaultChecked={value}
                    onCheckedChange={onChange}
                    {...rest}
                  />
                </FormControl>
                <FormLabel className="!mb-0">Двухфакторная авторизация</FormLabel>
              </div>
              <FormDescription>
                Включите, если состоите в командах, гильдиях или просто боитесь за свой аккаунт.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="app_extended_catalog"
          render={({ field: { value, onChange, ...rest } }) => (
            <FormItem>
              <div className="flex items-center gap-4">
                <FormControl>
                  <Switch checked={value} onCheckedChange={onChange} {...rest} />
                </FormControl>
                <FormLabel className="!mb-0">Расширенный каталог</FormLabel>
              </div>

              <FormDescription>
                Читайте все произведения с сайта в нашем приложении.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={disabled}>
          Сохранить изменения
        </Button>
      </form>
    </Form>
  );
};
