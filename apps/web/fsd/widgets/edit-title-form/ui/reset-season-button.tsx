'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useParams } from 'next/navigation';

import dayjs from 'dayjs';

import { Button } from '@re/ui-kit/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@re/ui-kit/ui/dialog';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { TitleRepository } from '~entities/title/model/repository';
import { useBoolean } from '~shared/hooks/use-boolean';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { Input } from '~shared/ui/input';
import { importToastAsync } from '~shared/ui/toast/toast.async';

export const ResetSeasonButton = () => {
  const params = useParams<{ dir: string }>();
  const dateFormat = useSiteConfig((v) => v.localization.dateFormat);
  const { getValues } = useFormContext();
  const [loading, setLoading] = useState(false);
  const [isOpen, , setOpen] = useBoolean();
  const [moderatorMessage, setModeratorMessage] = useState('');

  const onSubmit = async () => {
    if (loading) return;

    setLoading(true);

    const toast = await importToastAsync();

    try {
      const data = {
        request_type: 'new_season',
        user_message: moderatorMessage,
      };
      await TitleRepository.update({ data, params: { dir: params.dir } });
      setOpen(false);
      toast.success('Заявка отправлена');
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  const newSeasonDate = getValues('title.new_season_date');

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button color="secondary">
            Последний сезон
            {newSeasonDate ? `: ${dayjs(newSeasonDate).format(dateFormat)}` : null}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            Предоставьте источник информации о новом сезоне. Дата нового сезона будет считаться от
            принятия заявки модератором.
            <Input
              value={moderatorMessage}
              onChange={(e) => setModeratorMessage(e.target.value)}
              placeholder="Сообщение модератору"
            />
            <Button type="submit" className="self-end">
              Отправить на модерацию
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
