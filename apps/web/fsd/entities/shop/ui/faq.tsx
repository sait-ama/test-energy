import Link from 'next/link';
import { useTranslations } from 'next-intl';

import Activity from '@re/ui-kit/icons/activity';
import ExternalLink from '@re/ui-kit/icons/external-link';
import QuestionMark from '@re/ui-kit/icons/question-mark';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import { InfoModalType } from '~shared/api/models/info-modal';
import { Routing } from '~shared/config/routing';
import { useInfoModal } from '~shared/lib/info-modal/use-info-modal';
import { useSession } from '~shared/lib/session/use-session';
import { linkBaseVariants } from '~shared/ui/link-base';

export const ActivityFAQ = () => {
  const { open } = useInfoModal();
  const session = useSession();
  const t = useTranslations('activities.faq');

  const handleOpenModal = () => {
    open({
      type: InfoModalType.CONTENT,
      content: (
        <div>
          <ReText className="mb-4">{t('description')}</ReText>

          <ReText>{t('daily_rewards_title')}</ReText>

          <ul className="mb-4">
            <ReText asChild color="muted-foreground">
              <li>{t('daily_rewards.login')}</li>
            </ReText>

            <ReText asChild color="muted-foreground">
              <li>{t('daily_rewards.comment')}</li>
            </ReText>
            <ReText asChild color="muted-foreground">
              <li>{t('daily_rewards.chapters')}</li>
            </ReText>
          </ul>

          <ReText>{t('multipliers_title')}</ReText>

          <ul className="mb-4">
            <ReText asChild color="muted-foreground">
              <li className="flex items-center gap-1">
                {t('multipliers.subscription')}
                {session ? (
                  <Link
                    prefetch={false}
                    href={Routing.User.subscription()}
                    className={linkBaseVariants()}
                  >
                    <ExternalLink className="size-6" />
                  </Link>
                ) : null}
              </li>
            </ReText>

            <ReText asChild color="muted-foreground">
              <li className="flex items-center gap-1">
                {t('multipliers.guild')}
                <Link prefetch={false} href={Routing.Club.top()} className={linkBaseVariants()}>
                  <ExternalLink className="size-6" />
                </Link>
              </li>
            </ReText>
          </ul>

          <ReText>{t('multipliers_note')}</ReText>
        </div>
      ),
      title: (
        <span className="flex items-center gap-2">
          {t('title')} <Activity className="size-6" />
        </span>
      ),
    });
  };

  return (
    <Button
      variant="link"
      color="foreground"
      className="flex items-center gap-2"
      onClick={handleOpenModal}
    >
      <span className="hidden md:block">{t('get_button')}</span>
      <QuestionMark className="size-4" />
    </Button>
  );
};
