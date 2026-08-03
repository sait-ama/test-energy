import { createContext, ReactNode, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { V2DashboardPromoRetrieveResponses } from '@re/api/generated/types.gen';
import { hashKey } from '@tanstack/query-core';
import { useQueries, UseQueryOptions, useSuspenseQuery } from '@tanstack/react-query';

import { getDateFields, getStatisticsFields } from '~features/(publisher)/promo/model/utils';
import { client } from '~shared/api/client';
import {
  v2DashboardPromoAggregationRetrieveOptions,
  v2DashboardPromoRetrieveOptions,
} from '~shared/api/generated/tanstack';
import { queryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { deduplicate } from '~shared/utils/record-deduplicator';
import { useStrictContext } from '~shared/utils/use-strict-context';

import { useCurrentPagePublisherQuery } from './hooks';
import { TitlePromoListTableItemSchema } from './types';

export interface TitlePromoListTableStoreSchema {
  data: TitlePromoListTableItemSchema[];
  loadPromoList: (titleId: number) => Promise<void>;
}

export const TitlePromoListTableStore = createContext<TitlePromoListTableStoreSchema | null>(null);

export interface TitlePromoListTableStoreProviderProps {
  children: ReactNode;
}

export const TitlePromoListTableStoreProvider = ({
  children,
}: TitlePromoListTableStoreProviderProps) => {
  const tTable = useTranslations(
    'publisher.segments.profile-layout.advertisement.sections.ad-table'
  );
  const { data: publisher } = useCurrentPagePublisherQuery();

  const [promoListQueriesOptions, setPromoListQueriesOptions] = useState<
    UseQueryOptions<V2DashboardPromoRetrieveResponses[200]>[]
  >([]);

  const promoListQueries = useQueries({ queries: promoListQueriesOptions });

  const promoListData = promoListQueries
    .filter((it) => it.data)
    .map((it) => it.data ?? [])
    .flat()
    .flatMap((it) => it.results);

  const { data: _titlesListData } = useSuspenseQuery(
    v2DashboardPromoAggregationRetrieveOptions({
      client,
      path: {
        publisher_id: publisher.id,
      },
    })
  );

  const titlesListData = _titlesListData.results;

  const loadPromoList = async (titleId: number) => {
    const queryOptions: UseQueryOptions<V2DashboardPromoRetrieveResponses[200]> =
      v2DashboardPromoRetrieveOptions({
        client,
        path: {
          publisher_id: publisher.id,
        },
        query: {
          title_id: titleId,
          count: 50,
        },
      });
    await queryClient.prefetchQuery(queryOptions);

    setPromoListQueriesOptions((prev) =>
      deduplicate([...prev, queryOptions], (it) => hashKey(it.queryKey))
    );
  };

  const batchedData = useMemo<TitlePromoListTableItemSchema[]>(() => {
    return titlesListData.map((titlePromo) => {
      const promoList = promoListData.filter((it) => it.title?.id === titlePromo.title?.id);

      const children = promoList.length
        ? promoList.map((promo, index) => ({
            id: promo.id,
            name: tTable('labels.sub-item-label', { n: index + 1 }),
            href: promo.title
              ? Routing.Publisher.adDetails({
                  params: { dir: publisher.dir, titleDir: promo.title?.dir ?? '' },
                  query: { promo: String(promo.id) },
                })
              : null,
            ...getStatisticsFields([{ clicks: promo.count_clicks, views: promo.count_views }]),
            ...getDateFields({
              dateStart: promo.date_start ?? '',
              dateEnd: promo.date_end ?? '',
            }),
            $$hasChildren: false,
          }))
        : null;

      return {
        id: titlePromo.title?.id,
        name: titlePromo.title?.main_name ?? '---',
        href: titlePromo.title
          ? Routing.Publisher.adDetails({
              params: { dir: publisher.dir, titleDir: titlePromo.title?.dir ?? '' },
            })
          : null,
        ...getStatisticsFields([
          {
            clicks: titlePromo.last_promotion.count_clicks,
            views: titlePromo.last_promotion.count_views,
          },
        ]),
        ...getDateFields({
          dateStart: titlePromo.last_promotion.date_start ?? '',
          dateEnd: titlePromo.last_promotion.date_end ?? '',
        }),
        children,
        childrenCount: titlePromo.count,
        $$hasChildren: true,
      };
    });
  }, [titlesListData, promoListData]);

  const context: TitlePromoListTableStoreSchema = {
    data: batchedData,
    loadPromoList,
  };

  return (
    <TitlePromoListTableStore.Provider value={context}>
      {children}
    </TitlePromoListTableStore.Provider>
  );
};

export const useTitlePromoListTableStore = () => useStrictContext(TitlePromoListTableStore);
