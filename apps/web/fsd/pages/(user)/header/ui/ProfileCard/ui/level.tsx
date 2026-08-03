'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import QuestionMark from '@re/ui-kit/icons/question-mark';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { useUserQuery } from '~entities/user/model/queries';
import { InfoModalTrigger } from '~features/info-modal';
import { InfoModalType } from '~shared/api/models/info-modal';
import { SiteArticles } from '~shared/config/constants';

export const UserLevel = ({ className }: { className?: string }) => {
  const params = useParams<{ id: string }>();
  const { data } = useUserQuery({ variables: { params: { userId: params.id } } });
  const siteConfig = useSiteConfig();
  const t = useTranslations('user.level');
  const { level, chapters_read } = data!;

  const { next, ...current } = level;

  const currentLevel = current;
  const nextLevel = next || current;

  const chaptersAim = nextLevel.goal - currentLevel.goal;
  const progress = Math.max(0, chapters_read - currentLevel.goal);
  const progressProportion = chaptersAim ? progress / chaptersAim : 1;

  return (
    <div className={cn('cs-user-level flex items-center gap-2', className)}>
      <div
        className="cs-user-level-content border-border bg-card inline-flex h-[26px] w-full items-center gap-3 rounded-full border px-2.5 py-1.5"
        style={{
          maxWidth: 480,
        }}
      >
        <ReText
          size="xs"
          color="muted-foreground"
          className="cs-user-level-title flex whitespace-nowrap"
        >
          {t('prefix', { id: currentLevel.level })}
          <span className="hidden md:block">
            {t.rich('name', { name: currentLevel.name, br: () => <>&nbsp;</> })}
          </span>
        </ReText>
        <div className="bg-muted h-[14px] w-full max-w-[240px] overflow-hidden rounded-full lg:max-w-[280px]">
          <div
            className="h-[14px] rounded-full"
            style={{
              width: `${progressProportion * 100}%`,
              backgroundImage: `linear-gradient(to right, ${currentLevel.color}, ${nextLevel.color} ${(1 / progressProportion) * 100}%)`,
            }}
          />
        </div>
        <ReText size="sm" weight="medium" className="whitespace-nowrap max-sm:text-xs">
          {t('progress', { current: progress, goal: chaptersAim ?? 0 })}
        </ReText>
      </div>
      {siteConfig.articles?.[SiteArticles.USER_INFO] ? (
        <InfoModalTrigger
          asChild
          options={{
            type: InfoModalType.ENTRY,
            entryId: siteConfig.articles[SiteArticles.USER_INFO],
          }}
        >
          <Button color="secondary" circle size="xs" className="text-muted-foreground">
            <QuestionMark size={16} />
          </Button>
        </InfoModalTrigger>
      ) : null}
    </div>
  );
};
