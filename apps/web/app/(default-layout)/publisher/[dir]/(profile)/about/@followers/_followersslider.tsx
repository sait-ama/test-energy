'use client';
import { useTranslations } from 'next-intl';

import { Button } from '@re/ui-kit/ui/button';

import { FollowersPublisher } from '~entities/user-subscriptions/ui/followers-slider';
import { Section, SectionTitle } from '~shared/ui/section';

export const FollowersSlider = () => {
  const t = useTranslations('reusable.sections');
  return (
    <div className="space-y-2">
      <Section>
        <SectionTitle
          aside={
            <Button variant="secondary" asChild>
              {t('common.show-all')}
            </Button>
          }
        >
          {t('followers')}
        </SectionTitle>
        <FollowersPublisher />
      </Section>
    </div>
  );
};
