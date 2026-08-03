'use client';
import type { ForwardedRef } from 'react';
import { forwardRef, useMemo } from 'react';
import Link from 'next/link';

import ExternalLink from '@re/ui-kit/icons/external-link';
import { Button } from '@re/ui-kit/ui/button';

import { useContentType } from '~app/providers/site-config-provider';
import { HomeSection, HomeSectionHeader } from '~entities/home/ui/home-section';
import { getTopTitlesQueryKey } from '~entities/title/model/queries';
import { SliderSkeleton, SliderView } from '~entities/title/ui/slider';
import { SliderItem } from '~entities/title/ui/slider/slider-item';
import { useTopParams } from '~entities/top/model/hooks';
import { getTopTabsQueryKey } from '~entities/top/model/queries';
import {
  InViewStateContainer,
  SectionVisibilityContextProvider,
  SectionVisibilityItem,
} from '~features/page-section-visibility/ui/section-visibility';
import { Routing } from '~shared/config/routing';
import type { ContentSuspenseQueryOptionsType } from '~shared/lib/react-query/content-suspense-query';
import { ContentSuspenseQuery } from '~shared/lib/react-query/content-suspense-query';
import { QuerySuspenseContainer } from '~shared/lib/react-query/query-suspense-container';

interface TopTopCategorySliderProps {
  enabled?: boolean;
  data: {
    label: string;
    id?: string;
  };
  options?: ContentSuspenseQueryOptionsType;
}

const TopCategorySlider = forwardRef(
  (props: TopTopCategorySliderProps, ref: ForwardedRef<HTMLDivElement>) => {
    const { data, enabled = true, options = undefined } = props;
    const contentType = useContentType();
    const { period } = useTopParams();

    const getTitlesSuspenseQuery = getTopTitlesQueryKey({
      variables: {
        query: { count: 10, period, tab_id: data.id },
      },
    });

    return (
      <HomeSection ref={ref} className="sm:px-0 md:px-0">
        <HomeSectionHeader
          withUnderline={false}
          label={data.label}
          action={
            <Button
              asChild
              variant="outline"
              circle
              className="hover:border-primary group transition-all duration-300"
            >
              <Link
                prefetch={false}
                aria-label="Больше"
                href={Routing.Title.top({
                  params: {
                    content: contentType,
                    tab: data.id ?? 'all',
                  }, // TODO: migrate to dir
                  query: { period },
                })}
              >
                <ExternalLink />
              </Link>
            </Button>
          }
        />
        <QuerySuspenseContainer fallback={<SliderSkeleton />} key={`${data.id}-${period}`}>
          <ContentSuspenseQuery queryOptions={getTitlesSuspenseQuery} options={options}>
            {({ data }) => (
              <SliderView data={data}>{({ model }) => <SliderItem model={model} />}</SliderView>
            )}
          </ContentSuspenseQuery>
        </QuerySuspenseContainer>
      </HomeSection>
    );
  }
);

export function TopCategoriesListPage() {
  const fallback = useMemo(
    () => (
      <HomeSection className="sm:px-0 md:px-0">
        <HomeSectionHeader isLoading />
        <SliderSkeleton />
      </HomeSection>
    ),
    []
  );

  return (
    <SectionVisibilityContextProvider className="space-y-8 md:space-y-16">
      <TopCategorySlider data={{ label: 'Все подряд' }} />
      <QuerySuspenseContainer
        fallback={
          <HomeSection className="sm:px-0 md:px-0">
            <HomeSectionHeader isLoading />
            <SliderSkeleton />
          </HomeSection>
        }
      >
        <ContentSuspenseQuery queryOptions={getTopTabsQueryKey({ variables: {} })}>
          {({ data }) =>
            new Array(data.length).fill(0).map((_, i) => (
              <SectionVisibilityItem key={i} fallback={fallback}>
                {({ onLoad, onError }) => (
                  <InViewStateContainer>
                    {({ inView, ref }) => (
                      <TopCategorySlider
                        ref={ref}
                        enabled={inView}
                        data={data[i]}
                        options={{ onSuccess: onLoad, onError }}
                      />
                    )}
                  </InViewStateContainer>
                )}
              </SectionVisibilityItem>
            ))
          }
        </ContentSuspenseQuery>
      </QuerySuspenseContainer>
    </SectionVisibilityContextProvider>
  );
}
