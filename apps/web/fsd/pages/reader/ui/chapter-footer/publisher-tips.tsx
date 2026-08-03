import { memo } from 'react';

import Coin from '@re/ui-kit/icons/coin';
import CoinIcon from '@re/ui-kit/icons/coin';
import { Button } from '@re/ui-kit/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@re/ui-kit/ui/dialog';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { usePublisherDonate } from '~entities/billing/model/mutations';
import { PublisherAvatar } from '~entities/publisher/ui/publisher-avatar';
import { useCurrentChapter } from '~entities/reader/model/hooks';
import { PublisherSchema } from '~shared/api/models/publisher';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { useLoggedCheck } from '~shared/lib/session/use-logged';
import { useSession } from '~shared/lib/session/use-session';
import { useGetConfirmation } from '~shared/lib/submit-action/use-submit-action';
import { importToastAsync } from '~shared/ui/toast/toast.async';

const PublisherTipsVariants = memo(
  ({ className, publisher }: { className?: string; publisher: PublisherSchema }) => {
    const session = useSession()!;
    const variants = [5, 10, 15];

    const getConfirmation = useGetConfirmation();

    const { mutateAsync: donate } = usePublisherDonate();

    const checkLogged = useLoggedCheck();

    const handleDonate = async (sum: number) => {
      if (!session) return;
      const toast = await importToastAsync();
      const balance = parseInt(session.balance, 10);

      if (balance < sum) {
        toast.error('Недостаточно монет');
        return;
      }

      const confirmed = await getConfirmation({
        title: 'Пожертвование переводчику',
        confirmVariant: 'default',
        description: `Вы уверены, что хотите сделать пожертвование переводчику "${publisher.name}"? Со счета будет списано ${sum} монет.`,
      });

      if (!confirmed) return;

      try {
        await donate({ sum, publisher: publisher.id });
      } catch (e) {
        logger.error(e);
        await resolveErrorAsync(e);
      }
    };

    return (
      <div className={cn('flex justify-center gap-2', className)}>
        {variants.map((sum, index) => (
          <Button
            variant={index === variants.length - 1 ? 'default' : 'secondary'}
            key={sum}
            onClick={checkLogged(() => handleDonate(sum))}
          >
            {sum} <Coin className="ml-2 size-4" />
          </Button>
        ))}
      </div>
    );
  }
);

PublisherTipsVariants.displayName = 'PublisherTipsVariants';

const PublisherTipsCard = memo((props: { publisher: PublisherSchema }) => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 rounded-md p-4 md:flex-row md:justify-between md:gap-2 md:p-2">
      <div className="group flex cursor-pointer items-center gap-4">
        <PublisherAvatar
          imgSrc={props.publisher.cover.mid ?? ''}
          size={60}
          className="rounded-sm object-cover transition-transform duration-300 select-none"
        />
        <div className="flex flex-col">
          <ReText size="sm" weight="medium" className="break-all">
            {props.publisher.name}
          </ReText>

          {props.publisher.donate_page_text && (
            <ReText color="muted-foreground" size="xs" className="break-all">
              {props.publisher.donate_page_text}
            </ReText>
          )}
        </div>
      </div>
      <PublisherTipsVariants className="mr-2" publisher={props.publisher} />
    </div>
  );
});

PublisherTipsCard.displayName = 'PublisherTipsCard';

const PublisherList = memo(() => {
  const { data: chapter } = useCurrentChapter();
  return (
    <div className="flex w-full flex-col items-center gap-2">
      {chapter?.publishers.map((publisher) => (
        <PublisherTipsCard key={publisher.id} publisher={publisher} />
      ))}
    </div>
  );
});

export const PublisherTipsButton = memo(() => (
  <Dialog>
    <DialogTrigger asChild>
      <div>
        <Button className="hidden sm:flex" color="secondary" size="lg" startIcon={<CoinIcon />}>
          Поддержать
        </Button>
        <Button className="sm:hidden" color="secondary" size="lg" circle>
          <CoinIcon />
        </Button>
      </div>
    </DialogTrigger>
    <DialogContent className="!mt-[100px] flex flex-col items-center sm:max-w-xl md:mt-0">
      <DialogTitle>Поддержать переводчиков</DialogTitle>
      <PublisherList />
    </DialogContent>
  </Dialog>
));
