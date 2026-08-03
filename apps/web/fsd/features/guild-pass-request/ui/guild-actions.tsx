import { useTranslations } from 'next-intl';

import DotsHorizontal from '@re/ui-kit/icons/dots-horizontal';
import { Button } from '@re/ui-kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@re/ui-kit/ui/dropdown-menu';

import { isRoleNotEqual } from '~entities/guild/lib/access';
import { useGuildMemberRole, useGuildQuery } from '~entities/guild/model/hooks';
import { isUserMainGuild } from '~entities/guild/model/utils';
import { useUpdateCurrentUser } from '~entities/user/model/mutations';
import { useLeaveClub } from '~features/guild-pass-request/model/mutations';
import { RoleEnum } from '~shared/api/models/guild-club';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { useSession } from '~shared/lib/session/use-session';
import { useConfirmedAsyncAction } from '~shared/lib/submit-action/use-submit-action';
import { TestProps } from '~shared/lib/test/utils/test-props';
import { importToastAsync } from '~shared/ui/toast/toast.async';

export const GuildActions = () => {
  const t = useTranslations('pages.guild.profile.main-guild');
  const { mutateAsync: mutateLeave, isPending: isLeavePending } = useLeaveClub();
  const { mutateAsync: mutateMain, isPending: isMakingMainPending } = useUpdateCurrentUser();
  const session = useSession()!;
  const { data: club } = useGuildQuery();

  const role = useGuildMemberRole();
  const canLeave = isRoleNotEqual({ role, targetRole: RoleEnum.CREATOR });
  const isMainGuild = isUserMainGuild({ club, session });

  const handleLeave = async () => {
    try {
      await mutateLeave();
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  const handleMakeGuildMain = async () => {
    const toast = await importToastAsync();

    try {
      await mutateMain({ main_club: club!.id });
      toast.success(t('make-main-success-message', { name: club!.name }));
    } catch (e: unknown) {
      logger.error(e);
      toast.error(t('make-main-error-message'));
    }
  };

  const handleLeaveWithConfirmation = useConfirmedAsyncAction(handleLeave, {
    title: `Подтвердите, что вы хотите покинуть гильдию ${club!.name}`,
    confirmVariant: 'destructive',
    closeVariant: 'secondary',
  });

  if (!canLeave && isMainGuild) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button circle color="secondary" size="sm">
          <DotsHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {!isMainGuild ? (
          <DropdownMenuItem asChild>
            <Button
              onClick={handleMakeGuildMain}
              loading={isMakingMainPending}
              variant="ghost"
              {...TestProps.id('guild-actions-make-guild-main')}
            >
              {t('make-main')}
            </Button>
          </DropdownMenuItem>
        ) : null}

        {canLeave ? (
          <DropdownMenuItem asChild>
            <Button
              onClick={handleLeaveWithConfirmation}
              loading={isLeavePending}
              variant="ghost"
              className="!text-destructive"
              {...TestProps.id('guild-actions-leave-guild')}
            >
              Покинуть гильдию
            </Button>
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
