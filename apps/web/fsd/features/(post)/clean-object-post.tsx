'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

import Close from '@re/ui-kit/icons/close';
import { Button, buttonVariants } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { TitleImage } from '~entities/title/ui/title-image';
import type { PostSchema } from '~shared/api/models/post';
import { Routing } from '~shared/config/routing';
import { useQueryPrimitiveParams } from '~shared/hooks/use-query-params';
import { Section, SectionContent } from '~shared/ui/section';

export const CleanObjectPost = ({ firstPost }: { firstPost: PostSchema }) => {
  const { value: object, setValue: setObject } = useQueryPrimitiveParams({ fieldName: 'title' });
  const [visible, setVisible] = useState(!!object);

  useEffect(() => {
    if (object) {
      setVisible(true);
    }
  }, [object]);

  if (!visible) return null;

  return (
    <Section className="mb-4 flex gap-4 py-4">
      <SectionContent className="mb-4 flex gap-4">
        {firstPost.title && (
          <TitleImage
            size={120}
            dir={firstPost.title.dir}
            src={firstPost.title.cover.mid ?? ''}
            alt={firstPost.title.main_name}
          />
        )}
        <span className="flex w-full justify-between gap-4">
          <ReText
            size="lg"
            lineClamp={1}
            className={cn({ 'hover:text-accent': !firstPost }, 'm-0 flex items-center')}
          >
            {firstPost
              ? `Вы смотрите посты по тайтлу "${firstPost.title?.main_name}"`
              : 'По этому тайтлу пока нет постов'}
          </ReText>
          <Button className="self-center" circle variant="destructive">
            <Close
              onClick={() => {
                setVisible(false);
                setObject('');
              }}
              className="text-desctructive"
            />
          </Button>
        </span>
      </SectionContent>
      {!!object && !firstPost && (
        <Link
          prefetch={false}
          className={cn(buttonVariants({ size: 'sm', variant: 'default' }), 'self-start px-4')}
          href={Routing.Forum.Create.create({
            query: {
              tags: ['2'], // TODO: siteConfig
              title: firstPost.title?.dir || object,
            },
          })}
        >
          Создать обсуждение
        </Link>
      )}
    </Section>
  );
};
