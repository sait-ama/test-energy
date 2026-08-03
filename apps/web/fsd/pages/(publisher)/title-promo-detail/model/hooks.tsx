import { useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useSuspenseQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { client } from '~shared/api/client';
import {
  v2DashboardPromoRetrieveOptions,
  v2PublishersRetrieve2Options,
  v2TitlesRetrieve2Options,
} from '~shared/api/generated/tanstack';
import { Routing } from '~shared/config/routing';

import { TitlePromoDetailPageParams } from './types';

export const useCurrentPageParams = () => useParams() as unknown as TitlePromoDetailPageParams;

export const useCurrentPageTitleQuery = () => {
  const params = useCurrentPageParams();
  const query = useSuspenseQuery(
    v2TitlesRetrieve2Options({
      client: client,
      path: {
        title_dir: params.titleDir,
      },
    })
  );

  return query;
};

export const useCurrentPagePublisherQuery = () => {
  const params = useCurrentPageParams();
  const query = useSuspenseQuery(
    v2PublishersRetrieve2Options({
      client: client,
      path: {
        publisher_dir: params.dir,
      },
    })
  );

  return query;
};

export const useCurrentPagePromoList = () => {
  const { data: publisher } = useCurrentPagePublisherQuery();
  const { data: title } = useCurrentPageTitleQuery();

  const { data: _promoList } = useSuspenseQuery(
    v2DashboardPromoRetrieveOptions({
      client,
      path: {
        publisher_id: publisher.id,
      },
      query: {
        title_id: title.id,
        count: 50,
      },
    })
  );

  const promoList = useMemo(() => _promoList.results, [_promoList]);

  return promoList;
};

export const useTitlePromoDetailTabs = () => {
  const t = useTranslations('publisher-ad-title-page.content.tabs');
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useCurrentPageParams();

  const promoList = useCurrentPagePromoList();

  const promoIds = promoList.map((it) => String(it.id));
  const tabs = [
    {
      tLabel: t('labels.all'),
      value: 'all',
    },
    ...promoIds.map((it, index) => ({
      tLabel: t('labels.promo-n', { n: index + 1 }),
      value: it,
    })),
  ];

  const setTab = (tab: string) => {
    router.replace(
      Routing.Publisher.adDetails({
        params: {
          dir: params.dir,
          titleDir: params.titleDir,
        },
        query: {
          promo: tab,
        },
      })
    );
  };

  const tab = useMemo(() => {
    const promoParam = searchParams.get('promo');
    return promoIds.find((it) => it === promoParam) ?? 'all';
  }, [searchParams, promoIds]);

  return { tab, setTab, tabs };
};

export const useCurrentPageActivePromo = () => {
  const promoList = useCurrentPagePromoList();

  const activePromo = useMemo(() => {
    return (
      promoList.find(
        (it) =>
          dayjs().isSameOrAfter(dayjs(it.date_start)) && dayjs().isSameOrBefore(dayjs(it.date_end))
      ) || null
    );
  }, [promoList]);

  return activePromo;
};

export const useCurrentPagePromo = () => {
  const promoList = useCurrentPagePromoList();
  const { tab } = useTitlePromoDetailTabs();

  const activePromo = useMemo(() => {
    return promoList.find((it) => it.id === Number(tab)) || null;
  }, [promoList]);

  return activePromo;
};
