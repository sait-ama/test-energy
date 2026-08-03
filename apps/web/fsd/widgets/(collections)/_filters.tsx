'use client';
import { useTranslations } from 'next-intl';

import { useQuery } from '@tanstack/react-query';

import Close from '@re/ui-kit/icons/close';
import type { BadgeProps } from '@re/ui-kit/ui/badge';
import { Badge } from '@re/ui-kit/ui/badge';
import type { ButtonProps } from '@re/ui-kit/ui/button';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useTitleDetail } from '~entities/title/model/queries';
import { getSuspenseUserQuery } from '~entities/user/model/queries';
import { SearchField } from '~shared/api/models/search';
import type { TitleSchema } from '~shared/api/models/title';
import { useQueryParamsV2, useQueryPrimitiveParams } from '~shared/hooks/use-query-params';
import { useSearchModal } from '~shared/lib/search/use-search-modal';

const FieldButton = ({
  fieldName,
  children,
  className,
  onClick,
  clickSideEffect,
  ...buttonProps
}: { fieldName: string } & ButtonProps & {
    clickSideEffect?: (
      fieldName: string,
      value: string | undefined,
      setValue: (v: string | undefined) => void
    ) => void;
  }) => {
  const { value, setValue } = useQueryPrimitiveParams<string>({ fieldName: fieldName });

  return (
    <Button
      {...buttonProps}
      variant="flat"
      onClick={(e) => {
        onClick?.(e);
        clickSideEffect?.(fieldName, value, setValue);
      }}
      size="sm"
      className={cn('inline-block', className)}
    >
      {children}
    </Button>
  );
};

const BadgeField = ({ className, children, ...badgeProps }: BadgeProps) => {
  return (
    <Badge
      {...badgeProps}
      variant="secondary"
      className={cn(className, 'flex cursor-pointer gap-2 p-2')}
    >
      {children}
      <Close />
    </Badge>
  );
};

export const BadgesLabels = () => {
  const t = useTranslations('pages.collections.collections-page.sections.filters.search-by');

  const { setValues, values } = useQueryParamsV2<{
    title_dir: string;
    title_id: string;
    user_id: string;
  }>({
    defaultValues: { title_dir: undefined, user_id: undefined, title_id: undefined },
  });
  const { data: title } = useTitleDetail(
    { variables: { params: { dir: values?.title_dir! } } },
    {
      enabled: !!values?.title_dir,
      throwOnError: false,
    }
  );
  const { data: user } = useQuery({
    ...getSuspenseUserQuery({ variables: { params: { userId: values?.user_id! } } }),
    enabled: !!values?.user_id,
    throwOnError: false,
  });
  const isEmpty = !values?.title_dir && !values?.title_id && !values?.user_id;
  if (isEmpty) return null;
  return (
    <span className="mb-2 flex flex-wrap items-center gap-2">
      {values?.user_id && (
        <BadgeField onClick={() => setValues({ user_id: undefined })}>
          {user?.username || t('options.author.alt')}
        </BadgeField>
      )}
      {values?.title_id && (
        <BadgeField
          onClick={() =>
            setValues({
              title_id: undefined,
              title_dir: undefined,
            })
          }
        >
          {title?.main_name || t('options.title.alt')}
        </BadgeField>
      )}
    </span>
  );
};
export const Filters = () => {
  const t = useTranslations('pages.collections.collections-page.sections.filters');
  const { open: openSearchModal } = useSearchModal();
  const { setValues, values } = useQueryParamsV2<{
    title_dir: string;
    title_id: string;
    user_id: string;
  }>({
    defaultValues: { title_dir: undefined, user_id: undefined, title_id: undefined },
  });
  return (
    <div className="flex items-center gap-2">
      <ReText className="max-sm:hidden" size="sm" color="muted-foreground">
        {t('search-by.label')}
      </ReText>
      <FieldButton
        className={cn({ 'text-primary underline': !!values?.user_id })}
        clickSideEffect={() => {
          openSearchModal({
            hits: false,
            history: true,
            fields: [SearchField.users],
            onClick: (val) => {
              setValues({ user_id: String(val.id) });
            },
          });
        }}
        fieldName="user_id"
      >
        {t('search-by.options.author.title')}
      </FieldButton>
      <FieldButton
        className={cn({ 'text-primary underline': !!values?.title_id })}
        clickSideEffect={() => {
          openSearchModal({
            hits: false,
            history: true,
            fields: [SearchField.titles],
            onClick: (val) => {
              const v = val as TitleSchema;
              setValues({ title_id: String(v.id), title_dir: v.dir });
            },
          });
        }}
        fieldName="title_id"
      >
        {t('search-by.options.title.title')}
      </FieldButton>
    </div>
  );
};
