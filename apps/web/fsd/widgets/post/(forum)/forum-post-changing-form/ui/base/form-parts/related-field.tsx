'use client';
import { useFormContext } from 'react-hook-form';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { PublisherDetail } from '@re/api/generated/types.gen';
import { EditIcon } from '@re/ui-kit/icons/edit';
import { ExternalLinkIcon } from '@re/ui-kit/icons/external-link';
import Trash, { TrashIcon } from '@re/ui-kit/icons/trash';
import { Button } from '@re/ui-kit/ui/button';

import { useContentType } from '~app/providers/site-config-provider';
import { HorizontalSimpleTitleCard } from '~entities/title/ui/horizontal-simple-title-card';
import type { PublisherSchemaFragment } from '~shared/api/models/publisher';
import { SearchField as SearchFieldEnum } from '~shared/api/models/search';
import type { TitleSchemaFragment } from '~shared/api/models/title';
import { Routing } from '~shared/config/routing';
import { SearchField } from '~shared/lib/search/search-field';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '~shared/ui/form';
import { HorizontalCard } from '~shared/ui/horizontal-card';
import { mergeFunc } from '~shared/utils/merge-funcs';
import { preventDefault } from '~shared/utils/prevent-default';
export interface FormRelatedFieldProps {
  className?: string;
}

export const FormRelatedField = (props: FormRelatedFieldProps) => {
  const { className } = props;

  const tReusable = useTranslations('reusable');

  const { control } = useFormContext();
  const content = useContentType();

  return (
    <FormField
      control={control}
      name="relation"
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>Связанное</FormLabel>
          <FormControl>
            <SearchField<TitleSchemaFragment | PublisherSchemaFragment>
              onChange={(item, filters) => {
                const typeMap = {
                  [SearchFieldEnum.publishers]: 'publisher',
                  [SearchFieldEnum.titles]: 'title',
                } as const;

                if (!item) {
                  field.onChange(null);
                }
                if (!(filters?.field in typeMap)) return;

                field.onChange({
                  type: typeMap[filters.field],
                  id: item.id,
                  model: item,
                });
              }}
              //@ts-ignore
              value={field.value?.model}
              opts={{
                fields: [SearchFieldEnum.titles, SearchFieldEnum.publishers],
              }}
            >
              {({ onAction, remove }) => {
                if (!field.value)
                  return (
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full justify-start"
                      onClick={onAction}
                    >
                      {tReusable('actions.select')}
                    </Button>
                  );

                // if ('loader' in v) return <Skeleton className="aspect-[4/1]" />;

                if (field.value.type === 'title')
                  return (
                    <HorizontalSimpleTitleCard
                      className="p-4"
                      model={field.value.model as TitleSchemaFragment}
                      actions={
                        <div className="ml-auto flex items-center gap-4">
                          <Link
                            href={Routing.Title.detail({
                              params: {
                                dir: field.value.model.dir,
                                content,
                                tab: Routing.Title.TitleDetailTabs.MAIN,
                              },
                            })}
                          >
                            <Button
                              style={{ margin: 0 }}
                              className="mb-0 ml-auto h-9 items-center"
                              endIcon={<ExternalLinkIcon />}
                            >
                              {tReusable('actions.visit')}
                            </Button>
                          </Link>

                          <Button
                            circle
                            color="secondary"
                            onClick={mergeFunc(preventDefault, onAction)}
                          >
                            <EditIcon />
                          </Button>
                          <Button
                            variant="destructive"
                            circle
                            className="ml-auto"
                            onClick={mergeFunc(preventDefault, remove, () => {
                              field.onChange(null);
                            })}
                          >
                            <Trash />
                          </Button>
                        </div>
                      }
                    />
                  );

                if (field.value.type === 'publisher') {
                  const publisher = field.value.model as PublisherDetail;

                  return (
                    <HorizontalCard
                      name={publisher.name}
                      image={publisher.cover?.high}
                      actions={
                        <div className="ml-auto flex items-center gap-4">
                          <Button
                            style={{ margin: 0 }}
                            className="mb-0 ml-auto h-9 items-center"
                            endIcon={<ExternalLinkIcon />}
                          >
                            <Link
                              href={Routing.Club.clubByDir({
                                params: { dir: field.value.model.dir, tab: 'about' },
                              })}
                            >
                              {tReusable('actions.visit')}
                            </Link>
                          </Button>
                          <Button color="secondary" onClick={mergeFunc(preventDefault, onAction)}>
                            <EditIcon />
                          </Button>
                          <Button
                            variant="destructive"
                            circle
                            className="ml-auto"
                            onClick={mergeFunc(preventDefault, remove)}
                          >
                            <TrashIcon />
                          </Button>
                        </div>
                      }
                    />
                  );
                }
              }}
            </SearchField>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
<EditIcon />;
