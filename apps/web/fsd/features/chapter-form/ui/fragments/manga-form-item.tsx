import { useFormContext } from 'react-hook-form';

import { Button } from '@re/ui-kit/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@re/ui-kit/ui/dialog';

import {
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
  FileUploaderTrigger,
  SUPPORTED_FORMATS_ARCHIVES,
} from '~shared/ui/file-uploader';
import { FormConsumer, FormControl, FormField, FormItem, FormLabel } from '~shared/ui/form';

import { cutFileName, generateName } from '../../utils';
import {
  ChapterField,
  IsPaidField,
  NameField,
  PaidExpirationDateField,
  PriceField,
  PublishDateField,
  PublishersField,
  TomField,
} from '../fields/shared';

export interface FieldPropsBase {
  prefix?: string | null | undefined;
  className?: string;
  disabled?: boolean;
}

export interface PreviewButtonProps {
  className?: string;
  previewOpen: boolean;
  setPreviewOpen: (boolean: boolean) => void;
}

export const MangaFormItem = {
  TomField: ({ prefix, className, disabled }: FieldPropsBase) => (
    <TomField disabled={disabled} name={generateName(prefix, 'tome')} className={className} />
  ),
  ChapterField: ({ prefix, className, disabled }: FieldPropsBase) => (
    <ChapterField
      disabled={disabled}
      name={generateName(prefix, 'chapter')}
      className={className}
    />
  ),
  NameField: ({ prefix, className, disabled }: FieldPropsBase) => (
    <NameField disabled={disabled} name={generateName(prefix, 'name')} className={className} />
  ),
  PublishersField: ({ prefix, className, disabled }: FieldPropsBase) => (
    <PublishersField
      disabled={disabled}
      name={generateName(prefix, 'publisher')}
      className={className}
    />
  ),
  FileField: ({ prefix, className, disabled }: FieldPropsBase) => {
    const { control } = useFormContext();

    return (
      <FormField
        control={control}
        name={generateName(prefix, 'file')}
        key={generateName(prefix, 'file')}
        render={({ field, fieldState: { error } }) => (
          <FormItem className={className}>
            <FormLabel>Загружаемый файл</FormLabel>
            <FormControl>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    disabled={disabled}
                    size="lg"
                    variant={error ? 'destructive' : 'secondary'}
                    className="w-full"
                  >
                    {field.value?.name ? cutFileName(field.value.name, 25) : 'Выбрать файл'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogTitle>Выберите файл</DialogTitle>
                  <FileUploader
                    {...field}
                    defaultValue={field.value ? [field.value] : undefined}
                    value={field.value ? [field.value] : undefined}
                    onValueChange={(files) => {
                      const isMulti = files.length > 1;

                      if (isMulti) {
                        return;
                      }

                      const [file] = files;

                      field.onChange(file ?? null);
                    }}
                    opts={{
                      accept: SUPPORTED_FORMATS_ARCHIVES,
                      maxFiles: 1,
                      maxSize: 200 * 1024 * 1024,
                    }}
                    className="w-full"
                  >
                    {field.value ? (
                      <FileUploaderContent>
                        {field.value instanceof File && (
                          <FileUploaderItem file={field.value} index={0} />
                        )}
                      </FileUploaderContent>
                    ) : (
                      <FileUploaderTrigger className="w-full" />
                    )}
                  </FileUploader>
                </DialogContent>
              </Dialog>
            </FormControl>
          </FormItem>
        )}
      />
    );
  },
  PublishDateField: ({ prefix, className, disabled }: FieldPropsBase) => (
    <PublishDateField
      className={className}
      disabled={disabled}
      name={generateName(prefix, 'delay_pub_date')}
    />
  ),
  IsPaidField: ({ prefix, className, disabled }: FieldPropsBase) => (
    <IsPaidField className={className} disabled={disabled} name={generateName(prefix, 'is_paid')} />
  ),
  PriceField: ({ prefix, className, disabled }: FieldPropsBase) => (
    <FormConsumer name={generateName(prefix, 'is_paid')}>
      {({ value: isPaid }: any) =>
        isPaid ? (
          <PriceField
            className={className}
            disabled={disabled}
            name={generateName(prefix, 'price')}
          />
        ) : null
      }
    </FormConsumer>
  ),
  PaidExpirationDateField: ({ prefix, className, disabled }: FieldPropsBase) => (
    <FormConsumer name={generateName(prefix, 'is_paid')}>
      {({ value: isPaid }: any) =>
        isPaid ? (
          <PaidExpirationDateField
            className={className}
            disabled={disabled}
            name={generateName(prefix, 'pub_date')}
          />
        ) : null
      }
    </FormConsumer>
  ),
};
