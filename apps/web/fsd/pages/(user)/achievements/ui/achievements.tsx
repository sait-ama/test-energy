'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import ArrowIcon from '@re/ui-kit/icons/arrow-left';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import { AchievementCardWithModal } from '~entities/achievements/ui/achievement-card-with-modal';
import { useUserAchievements } from '~entities/user/model/queries';
import { Routing } from '~shared/config/routing';
import { EmptyView } from '~shared/ui/empty-view';
import { Underline } from '~shared/ui/underline';

export const Achievements = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useUserAchievements({ variables: { params: { userId: id } } });

  const achievements = data?.pages.flatMap((it) => it.results) || [];
  const isEmpty = !isLoading && !achievements.length;

  return (
    <div className="flex flex-col">
      <div className="mb-4">
        <Button variant="outline" asChild startIcon={<ArrowIcon />}>
          <Link
            shallow={false}
            prefetch={false}
            href={Routing.User.detail({ params: { id, tab: 'about' } })}
          >
            Назад
          </Link>
        </Button>
      </div>
      <Underline>
        <ReText size="2xl" component="h2">
          Ачивки
        </ReText>
      </Underline>
      <EmptyView isEmpty={isEmpty} className="h-[60vh]" text="Пусто" emoji="🏆">
        <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8">
          {achievements.map((data) => (
            <AchievementCardWithModal key={data.achievement.id} model={data} />
          ))}
        </div>
      </EmptyView>
    </div>
  );
};
