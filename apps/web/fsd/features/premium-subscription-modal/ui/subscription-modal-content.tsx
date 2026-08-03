'use client';

import { cloneElement } from 'react';

import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import { useSubscriptionQuery } from '~entities/subscription/model/api/queries';
import { useSubscriptionBenefits } from '~entities/subscription/model/api/utils';
import { useLoggedCheck } from '~shared/lib/session/use-logged';
import { useSession } from '~shared/lib/session/use-session';
import { LinearGradient } from '~shared/ui/linear-gradient';
import { UrlFormatter } from '~shared/utils/url-formatter';

export const SubscriptionModalContent = ({ onClose }: { onClose?: () => void }) => {
  const { data, isLoading } = useSubscriptionQuery();
  const id = useSession((v) => v?.id);
  const checkLogged = useLoggedCheck();
  const benefits = useSubscriptionBenefits();

  const handleBuy = checkLogged(() => {
    if (!onClose) return;
    // ymReachGoal(MetrikaGoals.Subscription.click);
    onClose();
  });

  if (isLoading) return null;

  return (
    <>
      <div>
        <LinearGradient
          width={150}
          height={300}
          src={UrlFormatter.media('public/app-promo-respect/girl.webp')}
          alt="Девочка"
        />
      </div>

      <div className="my-6 flex flex-col gap-4">
        {benefits.map((it) => (
          <div className="border-border bg-background rounded-md border p-4" key={it.name}>
            <ReText size="lg" className="flex items-center gap-1">
              {cloneElement(it.icon, { className: 'w-7 h-7 mr-2' })}
              {it.name}
            </ReText>
            <ReText className="mt-2" color="muted-foreground">
              {it.description}
            </ReText>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 left-0 flex w-full">
        <Button onClick={handleBuy} className="w-full" size="lg" asChild>
          <a
            rel="noreferrer"
            href={`/user/${id}/subscription?utm_source=inner&utm_medium=referral&utm_campaign=subscription&utm_content=${id}`}
          >
            Купить за {data?.price}₽ / месяц
          </a>
        </Button>
      </div>
    </>
  );
};
