import { useFormContext } from 'react-hook-form';

import Add from '@re/ui-kit/icons/add';
import { Button } from '@re/ui-kit/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@re/ui-kit/ui/dialog';

import type { CreateFilterPresetFormSchema } from '~features/create-filter-preset/model/validator';
import { CreateFilterPresetValidator } from '~features/create-filter-preset/model/validator';
import type { Preset } from '~features/filters-presents/ui/filters-presets';
import type { CatalogTitleQuerySchema } from '~shared/api/models/title';
import { useLocalStorageState } from '~shared/hooks/use-local-storage-state';
import { useOpen } from '~shared/hooks/use-open';
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
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { isJson } from '~shared/utils/is-json';
import { NArray } from '~shared/utils/NArray';
import { parseJson } from '~shared/utils/parse-json';

export const CreateFilterPreset = () => {
  const [open, toggle, close] = useOpen();
  const [presentString, setPresetString] = useLocalStorageState<string>('user-presets');
  const customPresets = isJson(presentString) ? parseJson<Preset[]>(presentString!)! : [];
  const form = useForm({
    schema: CreateFilterPresetValidator,
  });
  const { getValues } = useFormContext<CatalogTitleQuerySchema>();

  const onSubmit = async (form: CreateFilterPresetFormSchema) => {
    const toast = await importToastAsync();
    const values = getValues();

    const preset: Preset = {
      name: form.name,
      filters: values,
    };

    const presetByNameMap = NArray.newBy(customPresets).recordBy(
      (it) => it.name,
      () => true
    );

    if (presetByNameMap[form.name]) {
      // @ts-ignore
      form.setError('name', { message: 'Пресет с таким названием уже существует' });
      return;
    }

    setPresetString(JSON.stringify([...customPresets, preset]));
    toast.success('Шаблон сохранен');
    close();
  };

  return (
    <Dialog open={open} onOpenChange={toggle}>
      <DialogTrigger asChild>
        <Button color="secondary" endIcon={<Add />} data-testid="create-catalog-preset">
          Сохранить как шаблон
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="sr-only">Форма создания шаблона</DialogTitle>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col items-end space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Название шаблона</FormLabel>
                  <FormControl>
                    <Input data-testid="catalog-preset-name" {...field} />
                  </FormControl>
                  <FormDescription className="mt-1">До 15 символов</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" data-testid="catalog-preset-save">
              Сохранить
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
