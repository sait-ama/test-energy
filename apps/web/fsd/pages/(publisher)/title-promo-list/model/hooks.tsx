import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useApiGenSuspenseInfiniteQuery } from '@re/api/exports-core';
import { useSuspenseQuery } from '@tanstack/react-query';

import { client } from '~shared/api/client';
import {
  v2DashboardPromoBillingRetrieveInfiniteOptions,
  v2PublishersRetrieve2Options,
} from '~shared/api/generated/tanstack';

import { TitlePromoPageParams } from './types';

export const useCurrentPageParams = () => useParams() as unknown as TitlePromoPageParams;

export const useCurrentPagePublisherQuery = () => {
  const params = useCurrentPageParams();
  const query = useSuspenseQuery(
    v2PublishersRetrieve2Options({
      client,
      path: {
        publisher_dir: params.dir,
      },
    })
  );

  return query;
};

export const useTitlePromoListTabs = () => {
  const t = useTranslations('publisher.segments.profile-layout.advertisement.sections.tabs');

  const tabs = [
    {
      value: 'list',
      label: t('label', { tab: 'list' }),
    },
    {
      value: 'billing',
      label: t('label', { tab: 'billing' }),
    },
  ];
  const [tab, setTab] = useState('list');

  return { tab, setTab, tabs };
};

export const useCurrentPagePromoBillingQuery = () => {
  const { data: publisher } = useCurrentPagePublisherQuery();

  const query = useApiGenSuspenseInfiniteQuery(
    v2DashboardPromoBillingRetrieveInfiniteOptions({
      client: client,
      path: {
        publisher_id: publisher.id,
      },
    })
  );

  return query;
};
