'use client';
import { useFormContext } from 'react-hook-form';

import { useQuery } from '@tanstack/react-query';

import { v2ForumTagsRetrieveOptions } from '@re/api/generated/@tanstack/react-query.gen';
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from '@re/ui-kit/ui/multi-select';

import { client } from '~shared/api/client';
import { FormControl, FormField, FormItem } from '~shared/ui/form';
import { cn } from '~shared/utils/cn';
import { NArray } from '~shared/utils/NArray';

export interface FormTagsFieldProps {
  className?: string;
}

export const FormTagsField = (props: FormTagsFieldProps) => {
  const { className } = props;
  const { control } = useFormContext();
  const { data: { results: tags = [] } = {} } = useQuery(
    v2ForumTagsRetrieveOptions({
      client,
      query: { count: 200, page: 1 },
      cache: 'force-cache',
      next: { revalidate: 60 * 60 * 6, tags: ['forum-tags-filters'] },
    })
  );

  const labelResolver = NArray.newBy(tags).recordBy(
    (tag) => tag.id,
    (tag) => tag.name
  );

  return (
    <FormField
      control={control}
      name="tags"
      render={({ field }) => (
        <FormItem className={cn('flex items-center gap-2', className)}>
          <FormControl>
            <MultiSelector
              placeholder="Начните писать, а мы подскажем!"
              values={field.value ?? []}
              onValuesChange={field.onChange}
            >
              <MultiSelectorTrigger className="md:min-w-[200px]" labelResolver={labelResolver}>
                <MultiSelectorInput placeholder="Темы" />
              </MultiSelectorTrigger>
              <MultiSelectorContent className="max-h-[70px]">
                <MultiSelectorList>
                  {tags.map((tag) => (
                    <MultiSelectorItem value={String(tag.id)} key={tag.id}>
                      {tag.name}
                    </MultiSelectorItem>
                  ))}
                </MultiSelectorList>
              </MultiSelectorContent>
            </MultiSelector>
          </FormControl>
        </FormItem>
      )}
    />
  );
};
