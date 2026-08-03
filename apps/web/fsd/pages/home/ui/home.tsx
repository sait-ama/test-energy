'use client';
import { lazy, memo, Suspense, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import ExternalLink from '@re/ui-kit/icons/external-link';
import { Button } from '@re/ui-kit/ui/button';
import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';

import { useContentType } from '~app/providers/site-config-provider';
import { CollectionsSliderSkeleton } from '~entities/collection/ui/collections-slider-skeleton';
import { CollectionsSliderView } from '~entities/collection/ui/collections-slider-view';
import { HomeSection, HomeSectionHeader } from '~entities/home/ui/home-section';
import { getLatestChaptersListSuspenseInfiniteQuery } from '~entities/latest-chapter/model/queries';
import { LatestChapterItem } from '~entities/latest-chapter/ui/latest-chapter-item';
import {
  LatestChaptersList,
  LatestChaptersListContainer,
} from '~entities/latest-chapter/ui/latest-chapters-list';
import { LatestChaptersListSkeleton } from '~entities/latest-chapter/ui/latest-chapters-list-skeleton';
import { getPromotionsListSuspenseQuery } from '~entities/promotion/model/queries';
import { PromotionSkeleton } from '~entities/promotion/ui/promotion-skeleton';
import { PromotionsView } from '~entities/promotion/ui/promotion-slider-view';
import {
  getTitleSliderKey,
  getTitleSlidersListQueryKey,
  getTitlesListQueryKey,
} from '~entities/title/model/queries';
import { SliderItem } from '~entities/title/ui/slider/slider-item';
import { SliderSkeleton } from '~entities/title/ui/slider/slider-skeleton';
import { SliderView } from '~entities/title/ui/slider/slider-view';
import { reV2UsersHistoryListInfiniteOptions } from '~entities/user/model/queries';
import { ContinueReadingSliderSkeleton } from '~features/continue-reading-slider/ui/continue-reading-slider-skeleton';
import { ContinueReadingSliderView } from '~features/continue-reading-slider/ui/continue-reading-slider-view';
import { HeroSliderSkeleton } from '~features/hero-slider/ui/hero-slider-skeleton';
import { HeroSliderView } from '~features/hero-slider/ui/hero-slider-view';
import { ListColumnContainer } from '~features/horizontal-slider-list/list-column-container';
import { ListColumnContent } from '~features/horizontal-slider-list/list-column-content';
import { ListSkeleton } from '~features/horizontal-slider-list/list-skeleton';
import { SnapScrollWrapper } from '~features/horizontal-slider-list/snap-scroll-wrapper';
import {
  OnlyMyContextConsumer,
  OnlyMyLatestChapterContextProvider,
  OnlyMyLatestChaptersTrigger,
} from '~features/latest-chapters/ui/only-my-wrapper';
import { SectionVisibilityItem } from '~features/page-section-visibility/ui/section-visibility';
import { Promobanners } from '~features/promobanners/ui/promobanners';
import { HTTPRequestConfig } from '~shared/api/$api';
import { client } from '~shared/api/client';
import { v2TitlesCollectionsListOptions } from '~shared/api/generated/tanstack';
import type { OnlyMy } from '~shared/api/models/latest-chapter';
import { SiteNames } from '~shared/config/constants';
import { Routing } from '~shared/config/routing';
import { ExcludePremium } from '~shared/lib/auth/exclude-premium';
import { DomainExclusive } from '~shared/lib/domain/domain-exclusive';
import {
  ContentSuspenseInfiniteQuery,
  ContentSuspenseQuery,
} from '~shared/lib/react-query/content-suspense-query';
import { QuerySuspenseContainer } from '~shared/lib/react-query/query-suspense-container';
import { useLogged } from '~shared/lib/session/use-logged';
import { useSession } from '~shared/lib/session/use-session';
import { NoSSR } from '~shared/ui/no-ssr';

const OnlyMyLatestChaptersToggle = lazy(() =>
  import(
    /* webpackChunkName: "OnlyMyLatestChaptersToggle" */ '~features/latest-chapters/ui/only-my-wrapper'
  ).then((m) => ({
    default: m.OnlyMyLatestChaptersToggle,
  }))
);

export const GeneralSlider = memo(() => {
  const isLogged = useLogged();

  const unauthorizedCache: HTTPRequestConfig = !isLogged
    ? {
        cache: 'force-cache',
        next: {
          revalidate: 20 * 60,
        },
      }
    : {};

  const getGeneralSliderQuery = getTitlesListQueryKey({
    variables: {
      query: { count: 20, slider: 'general' },
    },
    fetchOptions: unauthorizedCache,
  });

  return (
    <QuerySuspenseContainer fallback={<HeroSliderSkeleton />}>
      <ContentSuspenseQuery queryOptions={getGeneralSliderQuery}>
        {({ data }) => <HeroSliderView data={data} />}
      </ContentSuspenseQuery>
    </QuerySuspenseContainer>
  );
});

export const HotNewSlider = memo(
  () => {
    const contentType = useContentType();

    const isLogged = useLogged();

    const unauthorizedCache: HTTPRequestConfig = !isLogged
      ? {
          cache: 'force-cache',
          next: {
            revalidate: 60 * 60,
          },
        }
      : {};

    const getHotSliderQuery = getTitlesListQueryKey({
      variables: {
        query: { count: 20, slider: 'hot_new' },
      },
      fetchOptions: unauthorizedCache,
    });

    const t = useTranslations();

    return (
      <HomeSection>
        <HomeSectionHeader
          label={t('pages.home.home-banner.title')}
          action={
            <Button
              asChild
              variant="outline"
              circle
              className="hover:border-primary group transition-all duration-300"
            >
              <Link
                shallow={false}
                prefetch={false}
                aria-label={t('pages.home.common.more')}
                href={Routing.Title.hot({ params: { content: contentType } })}
              >
                <ExternalLink className="text-muted-foreground group-hover:text-primary transition-all duration-300" />
              </Link>
            </Button>
          }
        />
        <QuerySuspenseContainer fallback={<SliderSkeleton />}>
          <ContentSuspenseQuery queryOptions={getHotSliderQuery}>
            {({ data }) => (
              <SliderView data={data}>{({ model }) => <SliderItem model={model} />}</SliderView>
            )}
          </ContentSuspenseQuery>
        </QuerySuspenseContainer>
      </HomeSection>
    );
  },
  () => true
);

export const ContinueReadingSlider = memo(
  () => {
    const session = useSession()!;
    const t = useTranslations();

    const getHistoryQuery = reV2UsersHistoryListInfiniteOptions({
      api: {
        path: {
          user_id: session.id,
        },
        query: {
          only_unread: 1, // TODO: Никита, добавь плиз в схему
        },
      },
      suspense: true,
    });

    const header = (
      <HomeSectionHeader
        label={t('pages.home.continue-reading.title')}
        action={
          <Button
            asChild
            variant="outline"
            circle
            className="hover:border-primary group transition-all duration-300"
          >
            <Link
              shallow={false}
              prefetch={false}
              aria-label={t('pages.home.common.more')}
              href={Routing.User.history()}
            >
              <ExternalLink className="text-muted-foreground group-hover:text-primary transition-all duration-300" />
            </Link>
          </Button>
        }
      />
    );

    const fallback = (
      <>
        {header}

        <ContinueReadingSliderSkeleton />
      </>
    );

    return (
      <HomeSection>
        <SectionVisibilityItem defaultShown fallback={fallback}>
          {({ onLoad, onError }) => (
            <QuerySuspenseContainer fallback={fallback}>
              <ContentSuspenseInfiniteQuery
                queryOptions={getHistoryQuery}
                options={{ onSuccess: onLoad, onError }}
              >
                {({ data }) => (
                  <>
                    {data.pages?.length ? header : null}
                    <ContinueReadingSliderView data={data} />
                  </>
                )}
              </ContentSuspenseInfiniteQuery>
            </QuerySuspenseContainer>
          )}
        </SectionVisibilityItem>
      </HomeSection>
    );
  },
  () => true
);

const columnSkeleton = (
  <div className="w-full">
    <HomeSectionHeader isLoading />
    <ListSkeleton />
  </div>
);

const columnFallback = <ListSkeleton />;

export const ColumnSlider = memo(
  () => {
    const contentType = useContentType();

    const getSlidersListQuery = (type: number) =>
      getTitleSlidersListQueryKey({
        variables: {
          query: { type },
        },
      });

    const getSliderContentListQuery = (dir: NumberIsomorphic) =>
      getTitleSliderKey({
        variables: {
          params: {
            dir,
          },
        },
      });

    const t = useTranslations();

    return (
      <ScrollArea>
        <SnapScrollWrapper slim={false} className="gap-2">
          {new Array(3).fill(0).map((_, i) => (
            <QuerySuspenseContainer key={i} fallback={columnSkeleton}>
              <ContentSuspenseQuery queryOptions={getSlidersListQuery(2)}>
                {({ data }) => (
                  <ListColumnContainer className="rounded-md pt-2 pr-2 pl-2">
                    <HomeSectionHeader
                      label={data[i]!.name}
                      className="w-[85vw] max-sm:pl-2 sm:w-full md:px-2"
                      action={
                        <Button
                          asChild
                          variant="outline"
                          circle
                          className="hover:border-primary group transition-all duration-300"
                        >
                          <Link
                            prefetch={false}
                            aria-label={t('pages.home.common.more')}
                            href={Routing.Title.list({
                              params: {
                                content: contentType,
                                id: data[i]!.id,
                              },
                            })}
                          >
                            <ExternalLink className="text-muted-foreground group-hover:text-primary transition-all duration-300" />
                          </Link>
                        </Button>
                      }
                    />
                    <SectionVisibilityItem fallback={columnFallback}>
                      {({ onLoad, onError }) => (
                        <QuerySuspenseContainer fallback={columnFallback}>
                          <ContentSuspenseQuery
                            queryOptions={getSliderContentListQuery(data[i]!.dir)}
                            options={{ onSuccess: onLoad, onError }}
                          >
                            {({ data }) => <ListColumnContent data={data} />}
                          </ContentSuspenseQuery>
                        </QuerySuspenseContainer>
                      )}
                    </SectionVisibilityItem>
                  </ListColumnContainer>
                )}
              </ContentSuspenseQuery>
            </QuerySuspenseContainer>
          ))}
          <ScrollBar orientation="horizontal" />
        </SnapScrollWrapper>
      </ScrollArea>
    );
  },
  () => true
);

export const CollectionSlider = memo(
  () => {
    const t = useTranslations('pages.home');

    const getCollectionsQuery = v2TitlesCollectionsListOptions({
      client,
      query: {},
    });

    const fallback = <CollectionsSliderSkeleton />;

    return (
      <HomeSection>
        <HomeSectionHeader
          action={
            <Button
              asChild
              variant="outline"
              circle
              className="hover:border-primary group transition-all duration-300"
            >
              <Link
                shallow={false}
                prefetch={false}
                href={Routing.Collection.main()}
                aria-label={t('common.more')}
              >
                <ExternalLink className="text-muted-foreground group-hover:text-primary transition-all duration-300" />
              </Link>
            </Button>
          }
          label={t('collections-slider.title')}
        />

        <QuerySuspenseContainer fallback={fallback}>
          <ContentSuspenseQuery queryOptions={getCollectionsQuery}>
            {({ data }) => <CollectionsSliderView data={data.results} />}
          </ContentSuspenseQuery>
        </QuerySuspenseContainer>
      </HomeSection>
    );
  },
  () => true
);

export const PromotionSlider = memo(
  () => {
    const getPromotionsQuery = getPromotionsListSuspenseQuery({
      variables: {},
    });

    const fallback = <PromotionSkeleton />;

    const t = useTranslations();

    return (
      <HomeSection>
        <HomeSectionHeader label={t('pages.home.promotion-slider.title')} />
        <SectionVisibilityItem fallback={fallback}>
          {({ onLoad, onError }) => (
            <QuerySuspenseContainer fallback={fallback}>
              <ContentSuspenseQuery
                queryOptions={getPromotionsQuery}
                options={{ onSuccess: onLoad, onError }}
              >
                {({ data }) => <PromotionsView data={data} />}
              </ContentSuspenseQuery>
            </QuerySuspenseContainer>
          )}
        </SectionVisibilityItem>
      </HomeSection>
    );
  },
  () => true
);

export const CustomSliders = memo(
  () => {
    const contentType = useContentType();

    const SectionSliderFallback = useMemo(
      () => (
        <HomeSection>
          <HomeSectionHeader isLoading />
          <SliderSkeleton />
        </HomeSection>
      ),
      []
    );

    const getSlidersListQuery = (type: number) =>
      getTitleSlidersListQueryKey({
        variables: {
          query: { type },
        },
      });

    const getSliderContentListQuery = (dir: NumberIsomorphic) =>
      getTitleSliderKey({
        variables: {
          params: {
            dir,
          },
        },
      });

    const t = useTranslations();

    return (
      <QuerySuspenseContainer fallback={SectionSliderFallback}>
        <ContentSuspenseQuery queryOptions={getSlidersListQuery(1)}>
          {({ data }) =>
            new Array(data.length).fill(0).map((_, i) => (
              <SectionVisibilityItem key={i} fallback={SectionSliderFallback}>
                {({ onLoad, onError }) => (
                  <HomeSection>
                    <HomeSectionHeader
                      label={data[i].name}
                      action={
                        <Button
                          asChild
                          variant="outline"
                          circle
                          className="hover:border-primary group transition-all duration-300"
                        >
                          <Link
                            prefetch={false}
                            aria-label={t('pages.home.common.more')}
                            href={Routing.Title.list({
                              params: {
                                content: contentType,
                                id: data[i].id,
                              },
                            })}
                          >
                            <ExternalLink className="text-muted-foreground group-hover:text-primary transition-all duration-300" />
                          </Link>
                        </Button>
                      }
                    />
                    {/*<HomeSectionLazyWrapper fallback={<CommonSliderSkeleton />}>*/}
                    <QuerySuspenseContainer fallback={<SliderSkeleton />}>
                      <ContentSuspenseQuery
                        queryOptions={getSliderContentListQuery(data[i].dir)}
                        options={{
                          onSuccess: () => {
                            onLoad();
                          },
                          onError: () => {
                            onError();
                          },
                        }}
                      >
                        {({ data }) => (
                          <SliderView data={data}>
                            {({ model }) => <SliderItem model={model} />}
                          </SliderView>
                        )}
                      </ContentSuspenseQuery>
                    </QuerySuspenseContainer>
                    {/*</HomeSectionLazyWrapper>*/}
                  </HomeSection>
                )}
              </SectionVisibilityItem>
            ))
          }
        </ContentSuspenseQuery>
      </QuerySuspenseContainer>
    );
  },
  () => true
);

export const LastUpdatesList = memo(
  () => {
    const getLatestChaptersInfiniteQuery = (onlyMy: OnlyMy) =>
      getLatestChaptersListSuspenseInfiniteQuery({
        variables: {
          query: {
            bookmarks: onlyMy,
          },
        },
      });

    const fallback = (
      <LatestChaptersListContainer>
        <LatestChaptersListSkeleton />
      </LatestChaptersListContainer>
    );

    const t = useTranslations();
    return (
      <HomeSection>
        <OnlyMyLatestChapterContextProvider>
          <HomeSectionHeader
            label={t('pages.home.last-updates.title')}
            action={
              <OnlyMyLatestChaptersTrigger>
                {(props) => (
                  <Suspense fallback={null}>
                    <OnlyMyLatestChaptersToggle {...props} />
                  </Suspense>
                )}
              </OnlyMyLatestChaptersTrigger>
            }
          />
          <SectionVisibilityItem fallback={fallback}>
            {({ onLoad, onError }) => (
              <QuerySuspenseContainer fallback={fallback}>
                <OnlyMyContextConsumer>
                  {({ onlyMy }) => (
                    <ContentSuspenseInfiniteQuery
                      queryOptions={getLatestChaptersInfiniteQuery(onlyMy)}
                      options={{ onSuccess: onLoad, onError }}
                    >
                      {(query) => (
                        <LatestChaptersList
                          renderItem={(item, itemProps) => (
                            <LatestChapterItem model={item} {...itemProps} />
                          )}
                          query={query}
                        />
                      )}
                    </ContentSuspenseInfiniteQuery>
                  )}
                </OnlyMyContextConsumer>
              </QuerySuspenseContainer>
            )}
          </SectionVisibilityItem>
        </OnlyMyLatestChapterContextProvider>
      </HomeSection>
    );
  },
  () => true
);

export const PromobannersSlider = memo(
  () => (
    <NoSSR>
      <ErrorBoundary fallback={null}>
        <ExcludePremium>
          <DomainExclusive only={[SiteNames.ReManga]}>
            <HomeSection>
              <Promobanners />
            </HomeSection>
          </DomainExclusive>
        </ExcludePremium>
      </ErrorBoundary>
    </NoSSR>
  ),
  () => true
);
