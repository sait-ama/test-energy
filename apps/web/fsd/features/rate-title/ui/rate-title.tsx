import React, { useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';

import { useQueryClient } from '@tanstack/react-query';

import Minus from '@re/ui-kit/icons/minus';
import Plus from '@re/ui-kit/icons/plus';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useSetTitleRating } from '~entities/title/model/mutations';
import { useTitleDetail } from '~entities/title/model/queries';
import { TitleKeys } from '~entities/title/model/query-keys';
import { ratings } from '~features/title-rating/model/const';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { Media } from '~shared/lib/media';
import { Display } from '~shared/lib/media/const';
import { TestProps } from '~shared/lib/test/utils/test-props';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { UrlFormatter } from '~shared/utils/url-formatter';

const useHandleRating = () => {
  const { mutateAsync } = useSetTitleRating();
  const queryClient = useQueryClient();
  const params = useParams<{ dir: string }>();
  const { data } = useTitleDetail({ variables: { params: { dir: params.dir } } });
  const { id: titleId, dir: titleDir } = data;

  return async (rating: number) => {
    const toast = await importToastAsync();
    try {
      await mutateAsync({ title: titleId, rating });
      await queryClient.invalidateQueries({
        queryKey: TitleKeys.retrieve({ params: { dir: titleDir } }),
      });
      toast.success('Оценка успешно поставлена');
    } catch (e: unknown) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };
};

interface RateProps {
  onRate?: () => void;
  className?: string;
}

export const RateTitle = (props: RateProps) => {
  const { onRate, className } = props;

  return (
    <div
      className={cn(
        'border-border relative flex h-[250px] w-full flex-col items-center justify-center overflow-hidden rounded-md border md:h-[168px]',
        className
      )}
    >
      <div className="relative size-full">
        <Image
          width="276"
          height="276"
          src={UrlFormatter.media('public/app/remanga.webp')}
          alt="Logo"
          className={cn(
            'pointer-events-none absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 opacity-[0.02]'
          )}
        />
        <Image
          width="276"
          height="276"
          src={UrlFormatter.media('public/app/remanga.webp')}
          alt="Logo"
          className={cn(
            'pointer-events-none absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 opacity-[0.02]'
          )}
        />
      </div>
      <div className="absolute flex flex-col gap-4 text-center">
        <ReText size="lg" weight="medium">
          Понравился тайтл? Поставь оценку!
        </ReText>
        <div className="align-center flex justify-center gap-2">
          <Media lessThan={Display.sm}>
            <MobileRate onRate={onRate} />
          </Media>
          <Media greaterThanOrEqual={Display.sm}>
            <Rate onRate={onRate} />
          </Media>
        </div>
      </div>
    </div>
  );
};

const Rate = (props: RateProps) => {
  const { onRate } = props;

  const params = useParams<{ dir: string }>();
  const { data } = useTitleDetail({ variables: { params: { dir: params.dir } } });
  const { rated } = data;

  const handleRating = useHandleRating();

  const handleRate = async (value: number) => {
    try {
      await handleRating(value);
      if (onRate) {
        onRate();
      }
    } catch (e: unknown) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  return (
    <div className="align-center flex flex-col justify-center gap-2">
      <div className="grid grid-cols-5 gap-1 md:grid-cols-10">
        {ratings.map((_, idx) => (
          <Button
            {...TestProps.id(`r_${idx + 1}_btn`)}
            color="secondary"
            className={cn(
              'font-bold hover:scale-[1.125]',
              rated !== undefined && rated >= idx + 1 && 'bg-primary text-primary-foreground',
              {
                // 'hover:text-destructive': idx <= 2,
                // 'hover:text-warning': idx >= 3 && idx <= 5,
                // 'hover:text-success': idx >= 6,
              }
            )}
            onClick={() => handleRate(idx + 1)}
            circle
            key={idx}
          >
            {idx + 1}
          </Button>
        ))}
      </div>
      <div className="flex w-full justify-between">
        <ReText color="muted-foreground">очень плохо</ReText>
        <ReText color="muted-foreground">отлично</ReText>
      </div>
    </div>
  );
};

const MobileRate = (props: RateProps) => {
  const { onRate } = props;

  const { data } = useTitleDetail({
    variables: { params: { dir: useParams<{ dir: string }>().dir } },
  });
  const { rated } = data;
  const [currentRating, setCurrentRating] = useState(rated || 5);

  const handleRating = useHandleRating();

  const handleRatingChange = (increment: boolean) => {
    setCurrentRating((prev) => {
      const newValue = increment ? prev + 1 : prev - 1;
      return Math.min(Math.max(newValue, 1), 10);
    });
  };

  const handleRate = async () => {
    try {
      await handleRating(currentRating);
      if (onRate) {
        onRate();
      }
    } catch (e: unknown) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3">
        <Button
          onClick={() => handleRatingChange(false)}
          disabled={currentRating <= 1}
          color="secondary"
          className="size-12 rounded-full"
        >
          <Minus className="size-5" />
        </Button>

        <div
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-full transition-all duration-200',
            'text-primary-foreground',
            'ring-primary/20 shadow-lg ring-2',
            { 'bg-primary': rated && rated === currentRating }
          )}
        >
          <ReText size="2xl" weight="bold">
            {currentRating}
          </ReText>
        </div>

        <Button
          onClick={() => handleRatingChange(true)}
          disabled={currentRating >= 10}
          color="secondary"
          className="size-12 rounded-full"
        >
          <Plus className="size-5" />
        </Button>
      </div>

      <div className="flex w-full flex-col gap-2">
        <Button onClick={handleRate} className="w-full">
          Поставить оценку
        </Button>
      </div>
    </div>
  );
};
