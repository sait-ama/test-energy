'use client';

import React from 'react';

import CoinIcon from '@re/ui-kit/icons/coin';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { usePurchaseBundle } from '~entities/title/model/mutations';
import { useTitleBundlesQuery } from '~entities/title/model/queries';
import type { BundlesSchema } from '~shared/api/models/title';
import { useChargeModal } from '~shared/lib/charge/use-charge-modal';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { useLoggedCheck } from '~shared/lib/session/use-logged';
import { useSession } from '~shared/lib/session/use-session';
import { useGetConfirmation } from '~shared/lib/submit-action/use-submit-action';
import { TestProps } from '~shared/lib/test/utils/test-props';
import { Carousel, CarouselContent, CarouselItem } from '~shared/ui/carousel';
import { importToastAsync } from '~shared/ui/toast/toast.async';

import { useCurrentPageSuspenseTitleDetail } from '../../../model/queries';
import { useCurrentTitleBranch } from '../../../model/store';

const BundleCard = ({ model, className, ...rest }) => (
  <div
    className={cn(
      'bg-secondary flex cursor-pointer flex-col items-center rounded-md p-4 select-none',
      className
    )}
    {...rest}
  >
    <ReText size="sm" color="muted-foreground">
      Главы
    </ReText>
    <ReText align="center" className="mb-2">
      {model.name}
    </ReText>
    <Button
      size="sm"
      startIcon={model.is_bought ? undefined : <CoinIcon />}
      disabled={!!model.is_bought}
      className="mt-2"
    >
      {model.is_bought ? 'Куплено' : model.price}
    </Button>
  </div>
);

export const BundlesList = () => {
  const [branch] = useCurrentTitleBranch();
  const { data: bundlesData } = useTitleBundlesQuery({
    variables: { params: { id: Number(branch) } },
  });
  const { data: title } = useCurrentPageSuspenseTitleDetail();
  const bundles = bundlesData?.content || [];
  const { open: openChargeModal } = useChargeModal();
  const { mutateAsync: purchaseBundle } = usePurchaseBundle({ params: { id: Number(branch) } });
  const getConfirmation = useGetConfirmation();
  const session = useSession()!;
  const checkLogged = useLoggedCheck();

  const isEmpty = !bundles.length;

  const handlePurchaseBundle = async (bundle: BundlesSchema) => {
    const notEnoughMoney = parseInt(session.balance, 10) < parseInt(bundle.price, 10);

    if (notEnoughMoney) {
      openChargeModal();
      return;
    }

    try {
      const confirmed = await getConfirmation({
        title: 'Купить бандл',
        confirmVariant: 'default',
        description: `Вы уверены, что хотите купить главы ${bundle.name} тайтла "${title?.main_name}"? Со счета будет списано ${bundle.price} монет`,
      });

      if (!confirmed) return;

      await purchaseBundle({ volume: bundle.id });

      const toast = await importToastAsync();

      toast.success(`Главы ${bundle.name} успешно куплены`);
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  if (isEmpty) return null;

  return (
    <div className="flex flex-col gap-4" {...TestProps.id('title-bundles')}>
      <Carousel
        opts={{
          align: 'start',
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="mx-1.5 -ml-2 md:mr-0">
          {bundles.map((bundle) => (
            <CarouselItem
              key={bundle.id}
              className="xs:basis-1/3 basis-1/2 pl-2 sm:basis-1/4 md:basis-1/4 lg:basis-1/4"
            >
              <BundleCard
                model={bundle}
                className="hover-card"
                onClick={checkLogged(() => handlePurchaseBundle(bundle))}
                {...TestProps.id('title-bundles-item')}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export const Bundles = () => {
  const { data: title } = useCurrentPageSuspenseTitleDetail();

  if (!title?.is_licensed) return null;

  return <BundlesList />;
};
