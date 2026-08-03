import type { ComponentType } from 'react';
import { useFormContext } from 'react-hook-form';

import { cn } from '@re/ui-kit/utils/cn';

import { UserAvatar } from '~entities/user/ui/user-avatar';
import { ShopImageItemType } from '~shared/api/models/shop';
import Title from '~shared/assets/placeholders/title';
import { useSession } from '~shared/lib/session/use-session';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~shared/ui/form';
import { Input } from '~shared/ui/input';
import { Section } from '~shared/ui/section';
import { Wallpaper, WallpaperBackground, WallpaperRoot } from '~shared/ui/wallpaper';
import type { CustomizationFormSchema } from '~widgets/customization-add-form/model/types';

interface CustomizationItemFormProps {
  type: ShopImageItemType;
}

interface UploadComponentProps {
  value: string;
}

const AvatarPreview = (props: UploadComponentProps) => {
  const { value } = props;

  return <UserAvatar unoptimized avatarSrc={value} alt="Аватар" size={144} />;
};

const FramePreview = (props: UploadComponentProps) => {
  const { value } = props;
  const session = useSession()!;

  return (
    <UserAvatar
      unoptimized
      avatarSrc={session.avatar.mid}
      frameSrc={value}
      alt="Аватар"
      size={144}
    />
  );
};

const WallpaperPreview = (props: UploadComponentProps) => {
  const { value } = props;

  return (
    <WallpaperRoot className="aspect-[2/1] max-h-[250px]">
      <WallpaperBackground className="h-full overflow-hidden rounded-sm">
        <Wallpaper src={value} fallback={<Title size={120} />} />
      </WallpaperBackground>
    </WallpaperRoot>
  );
};

const type2Component: Record<ShopImageItemType, ComponentType<UploadComponentProps>> = {
  [ShopImageItemType.AVATAR]: AvatarPreview,
  [ShopImageItemType.FRAME]: FramePreview,
  [ShopImageItemType.WALLPAPER]: WallpaperPreview,
};

export const CustomizationItemForm = (props: CustomizationItemFormProps) => {
  const { type } = props;
  const { control, setValue } = useFormContext<CustomizationFormSchema>();

  const isSquare = [ShopImageItemType.AVATAR, ShopImageItemType.FRAME].includes(type);

  const Preview = type2Component[type];

  const handleReset = () => {
    setValue('image', '');
  };

  return (
    <Section
      className={cn('flex flex-col items-center gap-4 md:flex-row', {
        'w-full flex-col md:flex-col': !isSquare,
      })}
    >
      <FormField
        control={control}
        name="image"
        render={({ field }) => (
          <FormItem className={cn('flex flex-col', { 'w-full': !isSquare })}>
            <FormMessage />
            <FormControl>
              {/*<ImageEditor*/}
              {/*    ref={ref}*/}
              {/*    aspect={isSquare ? 1 : 16 / 9}*/}
              {/*    // className={cn({ 'inline-flex': isSquare, 'w-full': !isSquare })}*/}
              {/*    onChange={field.onChange}*/}
              {/*    width={bounds.width}*/}
              {/*    height={isSquare ? bounds.width : bounds.width / 3}*/}
              {/*    // style={{*/}
              {/*    //     // ...(!isSquare ? { aspectRatio: '2/1' } : {}),*/}
              {/*    //     width: '100%',*/}
              {/*    //     height: '100%',*/}
              {/*    // }}*/}
              {/*    // height=*/}
              {/*>*/}
              {/*    <div className="flex flex-col items-center gap-1">*/}
              {/*        <Preview value={field.value?.preview} />*/}
              {/*        <Button variant="ghost" onClick={handleReset}>*/}
              {/*            Загрузить*/}
              {/*        </Button>*/}
              {/*    </div>*/}
              {/*</ImageEditor>*/}
            </FormControl>
          </FormItem>
        )}
      />
      <div className="flex w-full flex-col gap-2">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название</FormLabel>
              <FormControl>
                <Input onChange={field.onChange} defaultValue={field.value} />
              </FormControl>
              <FormDescription>
                Если ваш элемент кастомизации будет принят модерацией, вы получите его себе в
                инвентарь
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex w-full gap-2">
          <FormField
            control={control}
            name="cost"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Цена</FormLabel>
                <FormControl>
                  <Input type="number" onChange={field.onChange} defaultValue={field.value} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="amount"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Количество</FormLabel>
                <FormControl>
                  <Input type="number" onChange={field.onChange} defaultValue={field.value} />
                </FormControl>
                <FormDescription>Оставьте 0, если ограничений на покупку не будет</FormDescription>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </Section>
  );
};
