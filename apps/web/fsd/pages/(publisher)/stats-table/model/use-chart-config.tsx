import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

export const useChartConfig = () => {
  const t = useTranslations('publisher.segments.profile-layout.statistic.charts');
  return useMemo(
    () => ({
      payments: {
        partials: {
          payments_total: { label: t('payments.partials.payments-total'), color: '#ffc658' },
          donates_total: { label: t('payments.partials.donates-total'), color: '#8884d8' },
          referral_total: { label: t('payments.partials.referral-total'), color: '#88D884' },
        },
        allStatsArgs: {
          fields: ['payments', 'donates', 'referrals'],
          totals: ['payments_total', 'donates_total', 'referral_total'],
        },
        label: t('payments.label'),
        color: '#ffc658',
      },
      views: {
        allStatsArgs: { fields: 'bookmarks', totals: 'total' },
        label: t('views.label'),
        color: '#FDD5B1',
        partials: {
          views_total: { label: t('views.partials.views-total'), color: '#FDD5B1' },
          votes_total: { label: t('views.partials.votes-total'), color: '#edfc08' },
        },
      },
      bookmarks: {
        allStatsArgs: { fields: 'views', totals: 'total' },

        partials: {
          t: { label: t('bookmarks.partials.bookmarks-total'), color: '#3f50b5' },
        },

        label: t('bookmarks.label'),
        color: '#3f50b5',
      },
    }),
    []
  );
};
