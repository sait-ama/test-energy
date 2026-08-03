import { MouseEvent } from 'react';
import { useFormatter, useNow } from 'next-intl';

import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import { useClubRequestMutation } from '~entities/guild/api/mutations';
import { useDirDepClub } from '~entities/guild/model/hooks';
import { HorizontalUserCard } from '~entities/user/ui/horizontal-user-card';
import type { ClubRequestSchema } from '~shared/api/models/guild-club';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { getClientDate } from '~shared/utils/get-client-date';

export interface RequestProps {
  model: ClubRequestSchema;
}

export const RequestItem = ({ model: { user, created_at, id } }: RequestProps) => {
  const clientData = getClientDate({ serverDateString: created_at });
  const formatter = useFormatter();
  const dir = useDirDepClub();
  const now = useNow();

  const { mutateAsync } = useClubRequestMutation({ dir, id });

  const onSubmit = async (e: MouseEvent<HTMLButtonElement>, submit: boolean) => {
    e.preventDefault();
    try {
      await mutateAsync({ submit });
      const toast = await importToastAsync();
      toast.success(`Заявка ${user.username} была ${submit ? 'принята' : 'отклонена'}`);
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  return (
    <HorizontalUserCard
      model={user}
      prefetch={false}
      className="bg-secondary p-4"
      subtitleAsChild
      subtitle={
        <div className="flex flex-col gap-4">
          <ReText color="muted-foreground" size="xs">
            {formatter.relativeTime(clientData!, now)}
          </ReText>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClickCapture={(e) => onSubmit(e, false)}
              variant="default"
              color="background"
            >
              Отклонить
            </Button>
            <Button size="sm" onClickCapture={(e) => onSubmit(e, true)}>
              Принять
            </Button>
          </div>
        </div>
      }
    />
  );
};
