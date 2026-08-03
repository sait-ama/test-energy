'use client';

import { useMemo } from 'react';
import Link from 'next/link';

import ExternalLink from '@re/ui-kit/icons/external-link';
import { badgeVariants } from '@re/ui-kit/ui/badge';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useContentType } from '~app/providers/site-config-provider';
import { HorizontalSmallCreatorCard } from '~entities/creator/ui/horizontal-small-creator-card';
import { HorizontalSmallPublisherCard } from '~entities/publisher/ui/horizontal-small-publisher-card';
import { ContentTypes } from '~shared/config/constants';
import { Routing } from '~shared/config/routing';
import { useOpen } from '~shared/hooks/use-open';
import { ContentTypeExclusive } from '~shared/lib/domain/content-exclusive';
import { CopyItem } from '~shared/lib/react/copy-item';
import { isRussianRegExp } from '~shared/lib/regexp/is-russian';
import { TestProps } from '~shared/lib/test/utils/test-props';
import {
  EntityLayoutStatsLineItem,
  EntityLayoutStatsLineItemContent,
  EntityLayoutStatsLineItemTitle,
  EntityLayoutStatsLineRoot,
} from '~shared/ui/entity-layout';
import { Expandable } from '~shared/ui/expandable';
import { linkBaseVariants } from '~shared/ui/link-base';
import { Section, SectionContent } from '~shared/ui/section';

import { useCurrentPageSuspenseTitleDetail } from '../../../model/queries';

interface TagListItem {
  category?: boolean;
  genre?: boolean;
  id: string | number;
  dir?: string;
  name: string;
}

export const TagList = () => {
  const [open, toggle] = useOpen();
  const contentType = useContentType();
  const { data } = useCurrentPageSuspenseTitleDetail();

  const values: TagListItem[] = [
    ...data!.categories.map((it) => ({
      ...it,
      category: true,
    })),
    ...data!.genres.map((it) => ({ ...it, genre: true })),
  ];

  const hasMore = values.length > 10;

  return (
    <>
      {values.slice(0, open ? values.length : 10).map((it) => (
        <Link
          key={it.name}
          prefetch={false}
          href={Routing.Title.catalog({
            params: { content: contentType },
            normalizedParams: {
              [it.genre ? 'genres' : 'categories']: it.dir || it.id,
            },
          })}
          className={cn(
            badgeVariants({ variant: 'ghost' }),
            'hover:text-primary flex items-center gap-0.5 text-sm font-medium transition-colors'
          )}
          {...TestProps.id(`${it.category ? 'category' : 'genre'}_${it.id}_btn`)}
        >
          {it.category ? '' : ''}
          {it.name}
        </Link>
      ))}
      {hasMore ? (
        <ReText className="text-primary" asChild onClick={toggle} size="sm">
          <button>{open ? 'скрыть' : 'больше'}</button>
        </ReText>
      ) : null}
    </>
  );
};

const CreatorsList = () => {
  const { data } = useCurrentPageSuspenseTitleDetail();
  const creators = data?.creators || [];
  const [open, toggle] = useOpen();

  return (
    <>
      {creators.slice(0, open ? creators.length : 10).map((it) => (
        <HorizontalSmallCreatorCard
          key={it.id}
          model={it}
          {...TestProps.id('title-creator-item')}
        />
      ))}
      {creators.length > 10 ? (
        <ReText className="text-primary" asChild onClick={toggle} size="sm">
          <button>{open ? 'скрыть' : 'больше'}</button>
        </ReText>
      ) : null}
    </>
  );
};

const Creators = () => {
  const { data } = useCurrentPageSuspenseTitleDetail();

  const creators = data?.creators || [];

  if (!creators.length) return null;

  return (
    <EntityLayoutStatsLineItem className="flex-col gap-2 md:flex-row md:gap-0">
      <EntityLayoutStatsLineItemTitle>Создатели</EntityLayoutStatsLineItemTitle>
      <EntityLayoutStatsLineItemContent className="flex flex-wrap gap-2">
        <CreatorsList />
      </EntityLayoutStatsLineItemContent>
    </EntityLayoutStatsLineItem>
  );
};

const AltNames = () => {
  const { data } = useCurrentPageSuspenseTitleDetail();

  const alternativeNames = useMemo(
    () =>
      [data?.secondary_name, ...(data?.another_name ?? '').split('/')]
        // @ts-ignore
        .sort(([a, b]) => Number(isRussianRegExp(a)) - Number(isRussianRegExp(b)))
        .map((it) => it!.trim())
        .filter(Boolean),
    [data]
  );

  return (
    <EntityLayoutStatsLineItem className="mt-4 flex-col gap-2 md:flex-row md:gap-0">
      <EntityLayoutStatsLineItemTitle>Альтернативные названия</EntityLayoutStatsLineItemTitle>
      <EntityLayoutStatsLineItemContent
        className="flex flex-col items-start gap-2"
        component="span"
        {...TestProps.id('title-alt-name-list')}
      >
        <Expandable
          maxHeight={40}
          renderContent={(containerRef) => (
            <div ref={containerRef}>
              {alternativeNames.map((it) => (
                <p
                  key={it}
                  className="flex items-center gap-2"
                  {...TestProps.id('title-alt-name-item')}
                >
                  {it}
                  <CopyItem value={it} />
                </p>
              ))}
            </div>
          )}
        />
      </EntityLayoutStatsLineItemContent>
    </EntityLayoutStatsLineItem>
  );
};

export const InfoSection = () => {
  const { data } = useCurrentPageSuspenseTitleDetail();
  const contentType = useContentType();

  return (
    <Section
      className="bg-secondary dark:bg-background/50 rounded-md border-none p-2 md:p-4"
      {...TestProps.id('title-info-section')}
    >
      {/* <SectionTitle>О тайтле</SectionTitle> */}
      <SectionContent>
        <EntityLayoutStatsLineRoot>
          {/* <EntityLayoutStatsLineItem className="flex-col gap-2 md:flex-row md:gap-0">
            <EntityLayoutStatsLineItemTitle>Теги</EntityLayoutStatsLineItemTitle>
            <EntityLayoutStatsLineItemContent className="flex flex-wrap gap-2">
              <TagList />
            </EntityLayoutStatsLineItemContent>
          </EntityLayoutStatsLineItem> */}
          <EntityLayoutStatsLineItem className="flex-col gap-2 md:flex-row md:gap-0">
            <EntityLayoutStatsLineItemTitle>Паблишеры</EntityLayoutStatsLineItemTitle>
            <EntityLayoutStatsLineItemContent asChild className="flex flex-wrap gap-2">
              <div>
                {data?.branches
                  .flatMap((it) => it.publishers)
                  .map((it) => (
                    <HorizontalSmallPublisherCard
                      model={it}
                      key={it.id}
                      {...TestProps.id('title-publishers-item')}
                    />
                  ))}
              </div>
            </EntityLayoutStatsLineItemContent>
          </EntityLayoutStatsLineItem>
          <Creators />

          <EntityLayoutStatsLineItem className="mt-4">
            <EntityLayoutStatsLineItemTitle>Выпуск</EntityLayoutStatsLineItemTitle>
            <EntityLayoutStatsLineItemContent>
              <Link
                prefetch={false}
                href={Routing.Title.catalog({
                  params: { content: contentType },
                  query: { status: data.status?.id },
                })}
                className={cn(
                  linkBaseVariants(),
                  'text-foreground hover:text-primary flex items-center gap-0.5'
                )}
              >
                {data.status?.name}
                <ExternalLink className="h-4 w-4" />
              </Link>
            </EntityLayoutStatsLineItemContent>
          </EntityLayoutStatsLineItem>
          {data.translate_status?.id ? (
            <ContentTypeExclusive exclude={ContentTypes.SERIES}>
              <EntityLayoutStatsLineItem>
                <EntityLayoutStatsLineItemTitle>Статус перевода</EntityLayoutStatsLineItemTitle>
                <EntityLayoutStatsLineItemContent>
                  <Link
                    prefetch={false}
                    href={Routing.Title.catalog({
                      params: { content: contentType },
                      query: { translate_status: data.translate_status?.id },
                    })}
                    className={cn(
                      linkBaseVariants(),
                      'text-foreground hover:text-primary flex items-center gap-0.5'
                    )}
                  >
                    {data.translate_status?.name}
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </EntityLayoutStatsLineItemContent>
              </EntityLayoutStatsLineItem>
            </ContentTypeExclusive>
          ) : null}

          <EntityLayoutStatsLineItem>
            <EntityLayoutStatsLineItemTitle>Возрастное ограничение</EntityLayoutStatsLineItemTitle>
            <EntityLayoutStatsLineItemContent
              className={cn(data?.age_limit?.id === 2 && 'text-destructive')}
            >
              <Link
                prefetch={false}
                href={Routing.Title.catalog({
                  params: { content: contentType },
                  query: { age_limit: data.age_limit?.id },
                })}
                className={cn(
                  linkBaseVariants(),
                  'hover:text-primary flex items-center gap-0.5',
                  data?.age_limit?.id === 2 ? 'text-destructive' : 'text-foreground'
                )}
              >
                {data.age_limit?.name}
                <ExternalLink className="h-4 w-4" />
              </Link>
            </EntityLayoutStatsLineItemContent>
          </EntityLayoutStatsLineItem>
          <AltNames />
        </EntityLayoutStatsLineRoot>
      </SectionContent>
    </Section>
  );
};
