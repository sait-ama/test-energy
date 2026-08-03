'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { Button } from '@re/ui-kit/ui/button';

import { FollowersSlider } from '~entities/user-subscriptions/ui/followers-slider';
import { Routing } from '~shared/config/routing';
import { useTourItem } from '~shared/lib/tour/items';
import { Section, SectionTitle } from '~shared/ui/section';
import { FriendsSlider } from '~widgets/friend-preview-slider';

export const ActivitySection = () => {
  const params = useParams();

  const friendsTourProps = useTourItem('user-detail-about-friends');
  const followersTourProps = useTourItem('user-detail-about-followers');

  return (
    <div className="col-span-full flex w-full flex-col gap-4">
      <Section {...friendsTourProps} className="cs-friends-section">
        <SectionTitle
          aside={
            <Button color="secondary" asChild>
              <Link
                shallow={false}
                prefetch={false}
                href={Routing.User.friends({ params: { id: params.id } })}
              >
                Показать все
              </Link>
            </Button>
          }
        >
          Друзья
        </SectionTitle>
        <FriendsSlider />
      </Section>

      <Section {...followersTourProps} className="cs-subscribers-section">
        <SectionTitle
          aside={
            <Button color="secondary" asChild>
              <Link
                shallow={false}
                prefetch={false}
                href={Routing.User.followers({ params: { id: params.id } })}
              >
                Показать все
              </Link>
            </Button>
          }
        >
          Подписчики
        </SectionTitle>
        <FollowersSlider />
      </Section>
    </div>
  );
};
