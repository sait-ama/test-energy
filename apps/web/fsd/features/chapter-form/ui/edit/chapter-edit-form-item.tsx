import { memo } from 'react';

import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';
import dayjs from 'dayjs';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { useChapterContext } from '~features/chapter-form/model/store';
import { ContentTypes } from '~shared/config/constants';

import { MangaFormItem } from '../fragments/manga-form-item';
import { NovelFormItem } from '../fragments/novel-form-item';

interface FormItemBaseProps {
  contentType: ContentTypes;
  disabled?: boolean;
}

interface PublishDateProps {
  className?: string;
}
const PublishDate = ({ className }: PublishDateProps) => {
  const defaultData = useChapterContext((v) => v.constants.defaultData);
  //todo pubDate or upload_date, so pubdate may be null
  const pubDate = defaultData.pubDate || defaultData.upload_date;
  const datetimeFormat = useSiteConfig((v) => v.localization.datetimeFormat);

  return (
    <div className={cn(className)}>
      <ReText size="sm" weight="medium" className="mb-3">
        Опубликовано
      </ReText>
      <Button size="lg" variant="outline" disabled className="w-full">
        {dayjs(pubDate).format(datetimeFormat)}
      </Button>
    </div>
  );
};

const FormItemBase = memo(({ contentType, disabled }: FormItemBaseProps) => {
  const Comp = contentType === ContentTypes.MANGA ? MangaFormItem : NovelFormItem;
  const isPublished = useChapterContext((v) => v.constants.isPublished);

  return (
    <div className="my-2 flex flex-[1] flex-col gap-4">
      <div className="grid grid-cols-4 gap-4">
        <Comp.TomField disabled={disabled} className="col-span-4 md:col-span-1" />
        <Comp.ChapterField disabled={disabled} className="col-span-4 md:col-span-1" />
        <Comp.NameField disabled={disabled} className="col-span-4 md:col-span-2" />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Comp.PublishersField disabled={disabled} className="col-span-4 md:col-span-1" />
        {isPublished ? (
          <PublishDate className="col-span-4 md:col-span-1" />
        ) : (
          <Comp.PublishDateField disabled={disabled} />
        )}
        <Comp.FileField disabled={disabled} className="col-span-4 md:col-span-2" />
      </div>

      <Comp.IsPaidField disabled={disabled} />

      <div className="grid grid-cols-4 gap-4">
        <Comp.PriceField disabled={disabled} className="col-span-4 md:col-span-1" />
        <Comp.PaidExpirationDateField disabled={disabled} className="col-span-4 md:col-span-1" />
      </div>
    </div>
  );
});

export interface FormItemProps extends Omit<FormItemBaseProps, 'disabled'> {}

export const FormItem = ({ contentType }: FormItemProps) => {
  const disabled = useChapterContext((v) => v.constants.disabled);

  return <FormItemBase disabled={disabled} contentType={contentType} />;
};
