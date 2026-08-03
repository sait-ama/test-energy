import { type ComponentPropsWithoutRef, useEffect, useState } from 'react';
import Image from 'next/image';

import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { HeroCardPreviewModal } from '~entities/inventory/ui/hero-card-preview';
import { AuthTypes } from '~shared/api/models/auth';
import { useLocalStorageState } from '~shared/hooks/use-local-storage-state';
import { useAuthModal } from '~shared/lib/auth/use-auth-modal';
import { useLogged } from '~shared/lib/session/use-logged';
import { LinkBase } from '~shared/ui/link-base';
import { UrlFormatter } from '~shared/utils/url-formatter';

import { REGISTER_GIFT } from '../model/const';

export type RegisterGiftButtonProps = ComponentPropsWithoutRef<'div'>;

export const RegisterGiftButton = ({ className, ...rest }: RegisterGiftButtonProps) => {
  const { open: openAuthModal } = useAuthModal();
  const isLogged = useLogged();
  const [isNotTriggeredOnce, setIsNotTriggeredOnce] = useLocalStorageState<boolean>(
    'register-gift-button-shown-once',
    true
  );

  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (show || !isNotTriggeredOnce) return;

    setTimeout(() => setShow(true), 420_000); // 7 min
  }, [show, isNotTriggeredOnce]);

  const handleClick = () => {
    openAuthModal({ authType: AuthTypes.REGISTER });
    setIsNotTriggeredOnce(false);
    setShow(false);
    setOpen(false);
  };

  if (isLogged || !show) return null;

  return (
    <HeroCardPreviewModal
      open={open}
      onOpenChange={setOpen}
      card={REGISTER_GIFT}
      overrides={{
        fullContent: (
          <div className="mb-5 flex flex-col items-center gap-3">
            <ReText weight="semibold" size="lg">
              Вам выпала карточка!
            </ReText>
            <LinkBase>
              <ReText align="center" onClick={handleClick}>
                ПОЛУЧИТЬ
              </ReText>
            </LinkBase>
          </div>
        ),
      }}
    >
      <div
        className={cn(
          'bg-secondary flex h-[84px] w-[84px] cursor-pointer items-center justify-center rounded-md transition-opacity duration-200 hover:opacity-70',
          className
        )}
        {...rest}
      >
        <Image
          width={50}
          height={50}
          alt="Подарочек"
          src={UrlFormatter.media('public/gift-icon.webp')}
        />
      </div>
    </HeroCardPreviewModal>
  );
};
