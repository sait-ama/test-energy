import { memo } from 'react';

import StarIcon from '@re/ui-kit/icons/star';
import { Button } from '@re/ui-kit/ui/button';

import { RateTitle } from '~features/rate-title/ui/rate-title';
import { InfoModalType } from '~shared/api/models/info-modal';
import { useInfoModal } from '~shared/lib/info-modal/use-info-modal';
import { useLoggedCheck } from '~shared/lib/session/use-logged';

export const RatingButton = memo(() => {
  const { open: openInfoModal, close } = useInfoModal();
  const checkLogged = useLoggedCheck();

  const handleClick = checkLogged(() => {
    openInfoModal({
      type: InfoModalType.CUSTOM,
      content: <RateTitle onRate={close} />,
      contentProps: {
        className: 'max-w-lg border-none p-0',
      },
      srOnly: 'Оценка произведения',
    });
  });

  return (
    <>
      <Button
        className="hidden sm:flex"
        color="secondary"
        size="lg"
        onClick={handleClick}
        startIcon={<StarIcon className="text-[hsl(var(--r-warning))]" />}
      >
        Оценить
      </Button>
      <Button className="sm:hidden" color="secondary" size="lg" circle onClick={handleClick}>
        <StarIcon className="text-[hsl(var(--r-warning))]" />
      </Button>
    </>
  );
});
