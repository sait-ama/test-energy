'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import dayjs from 'dayjs';

import AddUser from '@re/ui-kit/icons/add-user';
import CalendarIcon from '@re/ui-kit/icons/calendar';
import CardsIcon from '@re/ui-kit/icons/cards';
import CommentsIcon from '@re/ui-kit/icons/comments';
import ExternalLink from '@re/ui-kit/icons/external-link';
import EyeIcon from '@re/ui-kit/icons/eye';
import Gender from '@re/ui-kit/icons/gender';
import GroupOfPersons from '@re/ui-kit/icons/group-of-persons';
import LikeIcon from '@re/ui-kit/icons/like';
import MessageIcon from '@re/ui-kit/icons/message';
import Pattern from '@re/ui-kit/icons/pattern';
import { buttonVariants } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { useUserSuspenseQuery } from '~entities/user/model/queries';
import { InfoModalType } from '~shared/api/models/info-modal';
import { useInfoModal } from '~shared/lib/info-modal/use-info-modal';
import { EntityLayoutStatsItem, EntityLayoutStatsRoot } from '~shared/ui/entity-layout';

export const StatsSection = () => {
  const { id } = useParams<{ id: string }>();
  const { data } = useUserSuspenseQuery({ variables: { params: { userId: id } } });
  const {
    date_joined,
    count_comments,
    count_friends,
    count_subscribers,
    count_cards,
    count_posts,
    count_votes,
    count_views,
    sex,
  } = data!;
  const dateFormat = useSiteConfig((v) => v.localization.dateFormat);
  const t = useTranslations('user.pages.about.stats');
  const { open: openInfoModal, close } = useInfoModal();

  const formattedDateJoined = dayjs(date_joined).format(dateFormat);
  const sexResolved = t('sex-resolved', { value: sex ?? 0 });

  const stats = [
    {
      icon: EyeIcon,
      label: t('views'),
      value: `${count_views}`,
    },
    {
      icon: LikeIcon,
      label: t('likes'),
      value: `${count_votes}`,
    },
    {
      icon: AddUser,
      label: t('friends'),
      value: `${count_friends}`,
    },
    {
      icon: MessageIcon,
      label: t('posts'),
      value: `${count_posts}`,
    },
    {
      icon: CommentsIcon,
      label: t('comments'),
      value: `${count_comments}`,
    },
    {
      icon: GroupOfPersons,
      label: t('subscribers'),
      value: `${count_subscribers}`,
    },
    {
      icon: Gender,
      label: t('sex'),
      value: sexResolved,
    },
    {
      icon: CardsIcon,
      label: t('cards'),
      value: `${count_cards}`,
    },
    {
      icon: CalendarIcon,
      label: t('date-joined', { sex: data.sex }),
      value: formattedDateJoined,
    },
  ] as const;

  const handleOpen = () => {
    openInfoModal({
      type: InfoModalType.CONTENT,
      title: 'Дополнительная статистика',
      content: (
        <div className="my-4 grid grid-cols-2 gap-4">
          {stats.slice(5).map((it) => (
            <>
              <ReText className="flex items-center gap-2" color="muted-foreground">
                <it.icon className="flex shrink-0" />
                {it.label}:&nbsp;
              </ReText>
              <ReText className="flex w-full justify-end" align="right">
                {it.value}
              </ReText>
            </>
          ))}
        </div>
      ),
    });
  };

  return (
    <EntityLayoutStatsRoot className="grid-cols-2 max-sm:grid-cols-3">
      {stats.slice(0, 5).map((it, i) => (
        <EntityLayoutStatsItem key={i} {...it} />
      ))}

      <li
        onClick={handleOpen}
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'cs-layout-stats-item group border-border bg-card relative flex h-full items-center justify-center overflow-hidden rounded-md border before:hidden'
        )}
      >
        <Pattern className="fill-skeleton group-hover:fill-primary absolute inset-0 z-[-1] h-full w-full scale-[1.5] rounded-md transition-all group-hover:scale-[2]" />
        <span className={buttonVariants({ variant: 'secondary', className: 'flex gap-2' })}>
          Больше <ExternalLink />{' '}
        </span>
      </li>
    </EntityLayoutStatsRoot>
  );
};
