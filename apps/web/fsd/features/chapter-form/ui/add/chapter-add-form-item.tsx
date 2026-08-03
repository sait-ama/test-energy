import { memo, type ReactNode, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import ArrowIcon from '@re/ui-kit/icons/arrow-left';
import { Alert, AlertDescription, AlertTitle } from '@re/ui-kit/ui/alert';
import { Button } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

import { useChapterContext, useChapterUploadContext } from '~features/chapter-form/model/store';
import { ContentTypes } from '~shared/config/constants';
import { Media } from '~shared/lib/media';
import { Display } from '~shared/lib/media/const';
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from '~shared/ui/drawer';

import { MangaFormItem } from '../fragments/manga-form-item';
import { NovelEditor } from '../fragments/novel-editor';
import { NovelFormItem } from '../fragments/novel-form-item';

interface FormItemBaseProps {
  id: string;
  contentType: ContentTypes;
  disabled?: boolean;
}

const FormItemBase = memo(({ id, contentType, disabled }: FormItemBaseProps) => {
  const prefix = `value.${id}.fields`;

  const Comp = contentType === ContentTypes.MANGA ? MangaFormItem : NovelFormItem;
  const {
    formState: { errors },
  } = useFormContext();

  //@ts-ignore
  const error = errors?.value?.[id]?.fields?.non_field_errors?.message as string | undefined;

  return (
    <div className="flex flex-col gap-4 p-4">
      {error ? (
        <Alert severity="error">
          <AlertTitle>Серверная ошибка:</AlertTitle>
          <AlertDescription className="mt-3">{error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="grid grid-cols-4 gap-4">
        <Comp.TomField disabled={disabled} prefix={prefix} className="col-span-4 lg:col-span-1" />
        <Comp.ChapterField
          disabled={disabled}
          prefix={prefix}
          className="col-span-4 lg:col-span-1"
        />
        <Comp.NameField disabled={disabled} prefix={prefix} className="col-span-4 lg:col-span-2" />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Comp.PublishersField
          disabled={disabled}
          prefix={prefix}
          className="col-span-4 lg:col-span-1"
        />
        <Comp.PublishDateField
          disabled={disabled}
          prefix={prefix}
          className="col-span-4 lg:col-span-1"
        />
        <Comp.FileField disabled={disabled} prefix={prefix} className="col-span-4 lg:col-span-2" />
      </div>

      <Comp.IsPaidField disabled={disabled} prefix={prefix} />

      <div className="grid grid-cols-4 gap-4">
        <Comp.PriceField disabled={disabled} prefix={prefix} className="col-span-4 lg:col-span-1" />
        <Comp.PaidExpirationDateField
          disabled={disabled}
          prefix={prefix}
          className="col-span-4 lg:col-span-1"
        />
      </div>
    </div>
  );
});

const EditNovelButton = memo(() => {
  const previewId = useChapterContext((v) => v.variables.previewId);
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Drawer direction="right" onOpenChange={setOpen} open={open}>
      <DrawerTrigger asChild>
        <Button>Редактировать</Button>
      </DrawerTrigger>
      <DrawerContent
        className={cn(
          'border-l-border fixed top-0 right-0 bottom-0 left-0 mt-0 h-full rounded-[0] border border-l-2 border-none'
        )}
        hideSwipeElement
      >
        <DrawerTitle className="sr-only">Редактировать главу</DrawerTitle>
        <div className="mx-4 my-5 flex flex-[0_0_auto] items-center justify-between">
          <Button variant="outline" startIcon={<ArrowIcon />} onClick={close}>
            Назад
          </Button>
        </div>
        <div className="overflow-y-auto px-4 pb-5">
          <NovelEditor
            previewedName={`value.${previewId}.fields`}
            textName={`value.${previewId}.fields.text`}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
});

const FormItemDrawer = ({
  children,
  contentType,
}: {
  children: ReactNode;
  contentType: ContentTypes;
}) => {
  const previewId = useChapterContext((v) => v.variables.previewId);
  const setVariables = useChapterContext((v) => v.setVariables);

  const isOpen = previewId != null;
  const close = () => setVariables((v) => ({ ...v, previewId: null }));

  return (
    <Drawer
      direction="right"
      onOpenChange={(v) => {
        if (!v) close();
      }}
      open={isOpen}
    >
      <DrawerContent
        className={cn(
          'border-l-border fixed top-0 right-0 bottom-0 left-0 mt-0 h-full rounded-[0] border border-l-2 border-none'
        )}
        hideSwipeElement
      >
        <DrawerTitle className="sr-only">Форма</DrawerTitle>
        <div className="mx-4 my-5 flex flex-[0_0_auto] items-center justify-between">
          <Button variant="outline" startIcon={<ArrowIcon />} onClick={close}>
            Назад
          </Button>
          {contentType === ContentTypes.NOVEL ? <EditNovelButton /> : null}
        </div>
        <div className="overflow-y-auto px-4 pb-5">{children}</div>
      </DrawerContent>
    </Drawer>
  );
};

export interface FormItemProps extends FormItemBaseProps {}

export const FormItem = memo(({ id, contentType }: FormItemProps) => {
  const formDisabled = useChapterContext((v) => v.constants.disabled);
  const isChapterUploaded = useChapterUploadContext((v) => v.isChapterUploaded);
  const itemDisabled = formDisabled || isChapterUploaded(id);

  const content = <FormItemBase id={id} contentType={contentType} disabled={itemDisabled} />;

  return (
    <>
      <Media lessThan={Display.md} className="hidden">
        <FormItemDrawer contentType={contentType}>{content}</FormItemDrawer>
      </Media>
      <Media greaterThanOrEqual={Display.md} className="flex-[1]">
        {content}
      </Media>
    </>
  );
});
