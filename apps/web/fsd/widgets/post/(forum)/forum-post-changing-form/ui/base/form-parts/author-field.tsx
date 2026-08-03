'use client';
import { Fragment } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';

import { Avatar, AvatarFallback, AvatarImage } from '@re/ui-kit/ui/avatar';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@re/ui-kit/ui/select';

import { FormControl, FormField, FormItem, FormMessage } from '~shared/ui/form';
import { UrlFormatter } from '~shared/utils/url-formatter';

import { useAvailableAuthors } from '../../../model/store';

export interface FormAuthorFieldProps {
  className?: string;
}

export const FormAuthorField = (props: FormAuthorFieldProps) => {
  const t = useTranslations('pages.forum');

  const { className } = props;
  const { control } = useFormContext();

  const availableAuthors = useAvailableAuthors();

  return (
    <FormField
      control={control}
      name="author"
      render={({ field }) => (
        <FormItem className={className}>
          <FormControl>
            <Select
              value={field.value ? `${field.value.type},${field.value.id}` : undefined}
              onValueChange={(key) => {
                if (!key) {
                  field.onChange(null);
                }

                const [type, id] = key.split(',');

                field.onChange({
                  id: Number(id),
                  type,
                });
              }}
            >
              <SelectTrigger className="[&>span]:overflow-visible">
                <SelectValue placeholder="Автор" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(availableAuthors).map(([groupName, group], index) => (
                  <Fragment key={groupName}>
                    {index !== 0 ? <SelectSeparator /> : null}
                    <SelectGroup>
                      <SelectLabel>{t(`actions.author-type.${groupName}`)}</SelectLabel>
                      {group.map((author) => {
                        const image = UrlFormatter.media(author.cover?.mid);

                        return (
                          <SelectItem
                            key={author.id}
                            aria-label={author.type}
                            value={`${author.type},${author.id}`}
                            // value={`${author.id}`}
                            className="cursor-pointer"
                          >
                            <span className="-my-0.5 -ml-3 flex items-center gap-2">
                              <Avatar className="rounded-md" src={image} size="xs">
                                <AvatarImage alt={author.name} />
                                <AvatarFallback>{author.name}</AvatarFallback>
                              </Avatar>
                              {author.name}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  </Fragment>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
