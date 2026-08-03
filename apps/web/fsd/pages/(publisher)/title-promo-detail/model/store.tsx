import { createContext, ReactNode } from 'react';

import { PromoTitle } from '@re/api/generated/types.gen';
import { useSuspenseQuery } from '@tanstack/react-query';

import { client } from '~shared/api/client';
import {
  v2DashboardPromoStatisticsListOptions,
  v2DashboardPromoStatisticsTitleListOptions,
} from '~shared/api/generated/tanstack';
import { useStrictContext } from '~shared/utils/use-strict-context';

import {
  useCurrentPagePublisherQuery,
  useCurrentPageTitleQuery,
  useTitlePromoDetailTabs,
} from './hooks';

export interface TitlePromoStatisticsStoreSchema {
  id: string;
  data: {
    title: PromoTitle;
    count_clicks?: number;
    count_views?: number;
    readonly date: string;
  }[];
}

export const TitlePromoStatisticsStore = createContext<TitlePromoStatisticsStoreSchema | null>(
  null
);

interface StatisticsDataProviderProps {
  children: ReactNode;
  id: string;
}

const AllStatisticsDataProvider = ({ children, id }: StatisticsDataProviderProps) => {
  const { data: publisher } = useCurrentPagePublisherQuery();
  const { data: title } = useCurrentPageTitleQuery();

  const { data } = useSuspenseQuery(
    v2DashboardPromoStatisticsTitleListOptions({
      client,
      path: {
        publisher_id: publisher.id,
        title_id: title.id,
      },
    })
  );
  const context: TitlePromoStatisticsStoreSchema = {
    id,
    data,
  };

  return (
    <TitlePromoStatisticsStore.Provider value={context}>
      {children}
    </TitlePromoStatisticsStore.Provider>
  );
};

const PromoStatisticsDataProvider = ({ children, id }: StatisticsDataProviderProps) => {
  const { data: publisher } = useCurrentPagePublisherQuery();

  const { data } = useSuspenseQuery({
    ...v2DashboardPromoStatisticsListOptions({
      client,
      path: {
        publisher_id: publisher.id,
        promo_id: Number(id),
      },
    }),
    select: (response) => {
      // todo: add promo_id field on backend
      return response.map((it) => ({
        ...it,
        promo_id: Number(id),
      }));
    },
  });
  const context: TitlePromoStatisticsStoreSchema = {
    id,
    data,
  };

  return (
    <TitlePromoStatisticsStore.Provider value={context}>
      {children}
    </TitlePromoStatisticsStore.Provider>
  );
};
export interface TitlePromoStatisticsStoreProviderProps {
  children: ReactNode;
}

export const TitlePromoStatisticsStoreProvider = ({
  children,
}: TitlePromoStatisticsStoreProviderProps) => {
  const { tab } = useTitlePromoDetailTabs();

  const StatisticsDataProvider =
    tab === 'all' ? AllStatisticsDataProvider : PromoStatisticsDataProvider;

  return <StatisticsDataProvider id={tab}>{children}</StatisticsDataProvider>;
};

export const useCurrentPageStatistics = () => useStrictContext(TitlePromoStatisticsStore);
