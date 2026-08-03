'use client';

import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@re/ui-kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@re/ui-kit/ui/card';
import { Checkbox } from '@re/ui-kit/ui/checkbox';
import { ReText } from '@re/ui-kit/ui/text';

import { useAgeSubmitted } from '~shared/lib/age-submit/use-age-submitted';
import { CookieService } from '~shared/utils/cookie-service';

export const SubmitAgeCard = ({
  onSubmit,
  onDecline,
}: {
  onSubmit?: () => void;
  onDecline?: () => void;
}) => {
  const router = useRouter();
  const { setAgeSubmitted } = useAgeSubmitted();

  const [showNoMore, setShowNoMore] = useState(false);

  const handleOk = () => {
    if (showNoMore) {
      CookieService.set('agesubmitted', 'true');
    }
    setAgeSubmitted({ value: true, persistValue: showNoMore });
    onSubmit?.();
  };

  const handleDecline = () => {
    onDecline?.();
    router.back();
  };

  const id = useId();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="mb-0 text-lg">Содержание для взрослых</CardTitle>
        <CardDescription className="">Запрещено для лиц младше 18</CardDescription>
      </CardHeader>
      <CardContent className="min-w-[340px] py-4">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={showNoMore}
            onCheckedChange={(v) => {
              setShowNoMore(!!v);
            }}
            id={id}
          />
          <ReText component="label" htmlFor={id}>
            Больше не показывать
          </ReText>
        </div>
      </CardContent>
      <CardFooter className="flex w-full flex-row gap-2">
        <Button variant="outline" onClick={handleDecline} className="w-full">
          Я здесь по ошибке
        </Button>
        <Button onClick={handleOk} className="w-full">
          Мне есть 18
        </Button>
      </CardFooter>
    </Card>
  );
};
