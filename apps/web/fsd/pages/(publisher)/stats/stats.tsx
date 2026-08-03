import { useTranslations } from 'next-intl';

import CardsIcon from '@re/ui-kit/icons/cards';
import Like from '@re/ui-kit/icons/like';
import Save from '@re/ui-kit/icons/save';

import { useCurrentPublisher } from '~entities/publisher/model/hooks';
import { StatsItem } from '~pages/(user)/header/ui/ProfileCard/ui/Stats/stats-item';
import { getAbbreviatedNumber } from '~shared/utils/get-abbreviated-number';

export const PublisherStats = () => {
  const t = useTranslations('publisher.segments.profile-layout.about.sections.stats');
  const { data: count_votes } = useCurrentPublisher((v) => v.content.count_votes);
  const { data: count_titles } = useCurrentPublisher((v) => v.content.count_titles);
  const { data: count_period_chapters } = useCurrentPublisher(
    (v) => v.content.count_period_chapters
  );

  return (
    <div className="flex flex-wrap gap-4 max-sm:justify-center">
      <StatsItem icon={<Like />}>
        {t('count_votes', { count: getAbbreviatedNumber(count_votes!) })}
      </StatsItem>
      <StatsItem icon={<Save />}>{t('count_titles', { count: count_titles! })}</StatsItem>
      <StatsItem icon={<CardsIcon />}>
        {t('count_period_chapters', { count: count_period_chapters! })}
      </StatsItem>
    </div>
  );
};
