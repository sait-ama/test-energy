import { useForm } from 'react-hook-form';

import { Button } from '@re/ui-kit/ui/button';
import { Checkbox } from '@re/ui-kit/ui/checkbox';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useTitleAddSimilar } from '~entities/title/model/mutations';
import { HorizontalTitleCard } from '~entities/title/ui/horizontal-title-card';
import type { TitleSchemaFragment } from '~shared/api/models/title';
import { SimilarByTypes } from '~shared/api/models/title';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { Form, FormControl, FormField, FormItem, FormLabel } from '~shared/ui/form';
import { importToastAsync } from '~shared/ui/toast/toast.async';

export interface AddSimilarFormProps {
  title: TitleSchemaFragment;
  targetTitle: TitleSchemaFragment;
  onSuccess?: () => void;
}

const SIMILAR_OPTIONS = [
  { value: SimilarByTypes.DRAW, label: 'рисовке' },
  { value: SimilarByTypes.GENRE, label: 'жанру' },
  { value: SimilarByTypes.HISTORY, label: 'сюжету' },
];

export const AddSimilarForm = ({ title, targetTitle, onSuccess }: AddSimilarFormProps) => {
  const form = useForm({
    defaultValues: {
      similar_dir: title.dir,
      [SimilarByTypes.DRAW]: false,
      [SimilarByTypes.GENRE]: false,
      [SimilarByTypes.HISTORY]: false,
    },
  });
  const { control, handleSubmit: handleSubmitForm } = form;
  const { mutateAsync: addSimilar } = useTitleAddSimilar({ params: { dir: targetTitle.dir } });

  const onSubmit = handleSubmitForm(
    async (value) => {
      try {
        await addSimilar(value);
        const toast = await importToastAsync();

        onSuccess?.();

        toast.success('Тайтл успешно добавлен');
      } catch (e) {
        logger.error(e);
        await resolveErrorAsync(e);
      }
    },
    (e) => logger.error(e, { scope: ['local'] })
  );

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4">
        <HorizontalTitleCard model={title} />
        <div>
          <ReText>
            Похож на
            <ReText component="span" weight="semibold">
              &#34;{targetTitle.main_name}&#34;
            </ReText>
            по:
          </ReText>
          <div className="mt-2 ml-1 flex flex-col gap-3">
            {SIMILAR_OPTIONS.map(({ value, label }) => (
              <FormField
                key={value}
                control={control}
                name={value}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel
                      className={cn('font-normal', !field.value && 'text-muted-foreground')}
                    >
                      {label}
                    </FormLabel>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>
        <div className="self-end">
          <Button onClick={onSubmit}>Подтвердить</Button>
        </div>
      </form>
    </Form>
  );
};
