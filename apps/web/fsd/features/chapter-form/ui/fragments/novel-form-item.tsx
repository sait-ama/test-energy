import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { useMutation } from '@tanstack/react-query';

import { Button } from '@re/ui-kit/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@re/ui-kit/ui/dialog';
import { ReText } from '@re/ui-kit/ui/text';

import { usePreviewIdFallback } from '~features/chapter-form/model/store';
import { patchedFetch } from '~shared/api/$api';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import {
  FileUploader,
  FileUploaderTrigger,
  SUPPORTED_FORMATS_DOCS,
} from '~shared/ui/file-uploader';
import { FormConsumer } from '~shared/ui/form';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { CookieService } from '~shared/utils/cookie-service';
import { publicEnv } from '~shared/utils/env';
import { UrlFormatter } from '~shared/utils/url-formatter';

import { generateName } from '../../utils';
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

const UploadFile = ({ className, disabled, prefix: prefixProp }: FieldPropsBase) => {
  const { setValue } = useFormContext();
  const previewIdFallback = usePreviewIdFallback();
  const [isOpen, setIsOpen] = useState(false);

  const prefix = `value.${previewIdFallback}.fields`;
  const name = `${prefix}.fields.content`;
  const controlledValueName = `${prefix}.fields.file`;

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const token = CookieService.get('token');
      const resolvedUrl = UrlFormatter.createUrl(
        publicEnv('GATEWAY_URL'),
        '/api/v2/titles/chapters/parse-docs/'
      );

      const response = await patchedFetch(resolvedUrl, {
        method: 'POST',
        body: formData,
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    onError: async (e) => {
      logger.error(e);
      await resolveErrorAsync(e);
    },
    onSuccess: async (data) => {
      const toast = await importToastAsync();
      toast.success('Поле контент успешно заполнено из файла');
    },
  });

  const handleUpload = async (file: File) => {
    try {
      return mutation.mutateAsync(file);
    } catch (error) {
      return null;
    }
  };

  const isDisabled = mutation.isPending || disabled;

  return (
    <div className={className}>
      <ReText size="sm" weight="medium" className="mb-3">
        Загрузить файл
      </ReText>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button disabled={isDisabled} size="lg" color="secondary" className="w-full">
            Выбрать файл
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogTitle>Выберите файл</DialogTitle>

          <FileUploader
            onValueChange={async (files) => {
              const isMulti = files.length > 1;

              const [file] = files;

              if (isMulti || !file) {
                return;
              }
              const result = await handleUpload(file);
              if (result) {
                setValue(name, result);
                setValue(controlledValueName, 'true');
                setIsOpen(false);
              }
            }}
            opts={{
              accept: SUPPORTED_FORMATS_DOCS,
              multiple: true,
              maxFiles: 20,
              maxSize: 20 * 1024 * 1024,
            }}
            className="w-full"
          >
            <FileUploaderTrigger className="w-full" />
          </FileUploader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const NovelFormItem = {
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
      name={generateName(prefix, 'publishers')}
      className={className}
    />
  ),
  FileField: UploadFile,
  PublishDateField: ({ prefix, className, disabled }: FieldPropsBase) => (
    <PublishDateField
      disabled={disabled}
      className={className}
      name={generateName(prefix, 'delay_pub_date')}
    />
  ),
  IsPaidField: ({ prefix, className, disabled }: FieldPropsBase) => (
    <IsPaidField disabled={disabled} className={className} name={generateName(prefix, 'is_paid')} />
  ),
  PriceField: ({ prefix, className, disabled }: FieldPropsBase) => (
    <FormConsumer name={generateName(prefix, 'is_paid')}>
      {({ value: isPaid }: any) =>
        isPaid ? (
          <PriceField
            disabled={disabled}
            className={className}
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
            disabled={disabled}
            className={className}
            name={generateName(prefix, 'pub_date')}
          />
        ) : null
      }
    </FormConsumer>
  ),
};
