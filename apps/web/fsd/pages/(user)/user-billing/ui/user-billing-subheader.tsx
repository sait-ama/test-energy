import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import {
  v2ActivityActiveGiftRetrieveOptions,
  v2ActivityPartnerGiftRewardCreateMutation,
} from '@re/api/generated/@tanstack/react-query.gen';
import Activity from '@re/ui-kit/icons/activity';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'use-intl';

import { UserPromoCodeFormSection } from '~pages/(user)/promocode/ui/user-promo-code-form-section';
import { UserBillingTab } from '~pages/(user)/user-billing/model/const';
import { useUserBillingTab } from '~pages/(user)/user-billing/model/hooks';
import { client } from '~shared/api/client';
import type { PartnerGift } from '~shared/api/generated/models';
import { InfoModalType } from '~shared/api/models/info-modal';
import { useOptimisticMutation } from '~shared/api/react-query';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { useInfoModal } from '~shared/lib/info-modal/use-info-modal';
import { logger } from '~shared/lib/logger';
import { useCooldown } from '~shared/lib/use-calldawn';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { mergeFunc } from '~shared/utils/merge-funcs';
import { UrlFormatter } from '~shared/utils/url-formatter';

const UserBillingCoinsSubheaderModal = ({
  gift,
  onSuccess,
}: {
  onSuccess?: () => void;
  gift: PartnerGift;
}) => {
  const t = useTranslations('user-billing-page.segments.coins.earn-more');
  const { link, image: { high: src } = {} } = gift;
  const { mutateAsync, isPending } = useOptimisticMutation({
    ...v2ActivityPartnerGiftRewardCreateMutation({ client }),
    onSuccess: () => {
      onSuccess?.();
    },
  });

  const handleClick = async () => {
    try {
      await mutateAsync({});
    } catch (e) {
      await resolveErrorAsync(e);
    }
  };

  return (
    <>
      <Image
        width={400}
        height={400}
        src={src?.length ? UrlFormatter.media(src) : '/modal/lightning.png'}
        alt="lightning"
        className="-mt-[250px]"
      />
      <div className="-mt-[90px] flex flex-col items-center">
        <ReText align="center" weight="semibold" size="lg">
          {t('title')}
        </ReText>
        <ReText align="center" size="md" color="muted-foreground">
          {t('description')}
        </ReText>

        <Button disabled={isPending} className="mt-6 flex" asChild onClick={handleClick}>
          <Link href={link} target="_blank">
            {t('do')}
          </Link>
        </Button>
      </div>
    </>
  );
};

const UserBillingCoinsSubheader = () => {
  const t = useTranslations('user-billing-page.segments.coins.earn-more');
  const { open, close } = useInfoModal();

  const {
    data: gift,
    isLoading,
    isError,
    isSuccess,
    refetch,
  } = useQuery(
    v2ActivityActiveGiftRetrieveOptions({
      client,
      query: { placement_type: 'billing' },
    })
  );

  const { isCooldown, startCooldown, clearCooldown } = useCooldown(3000);

  useEffect(() => {
    return () => {
      clearCooldown();
    };
  }, [clearCooldown]);

  const onClick = async () => {
    const toast = await importToastAsync();
    try {
      if (!gift?.link) {
        toast.error(t('non-gifts'));
        return;
      }

      open({
        type: InfoModalType.CUSTOM,
        srOnly: t('title'),
        content: (
          <UserBillingCoinsSubheaderModal
            onSuccess={mergeFunc(startCooldown, close, refetch)}
            gift={gift}
          />
        ),
      });
    } catch (e: unknown) {
      logger.error(e, { scope: ['local'] });
      toast.error('error');
    }
  };
  const cannotGetGift = (isSuccess && !gift?.link) || isError;
  const disabled = isLoading || cannotGetGift || isCooldown;

  return (
    <span className="flex flex-col items-center justify-center gap-2.5">
      <button
        disabled={disabled}
        onClick={onClick}
        className={cn(
          'flex items-center justify-center gap-2 rounded-md px-3 py-2 font-bold uppercase',
          {
            'opacity-70': disabled,
            'cursor-not-allowed': disabled,
          }
        )}
        style={{
          background: 'linear-gradient(135deg, #ffd800 0%, #fd5b00 100%)',
        }}
      >
        <Activity className="fill-white text-white" />
        {t('title')}
        <Activity className="fill-white text-white" />
      </button>
      {cannotGetGift && (
        <ReText size="sm" align="center" color="muted-foreground">
          {t('can-not-get-gift')}
        </ReText>
      )}
    </span>
  );
};

export const UserBillingSubheader = () => {
  const [value] = useUserBillingTab();

  if (value === UserBillingTab.COINS) {
    return <UserBillingCoinsSubheader />;
  }

  if (value === UserBillingTab.TICKETS) {
    return <UserPromoCodeFormSection withTitle={false} />;
  }

  return null;
};
