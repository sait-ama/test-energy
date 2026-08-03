'use client';

import type { FC } from 'react';
import { useEffect, useState } from 'react';

import { ReText } from '@re/ui-kit/ui/text';

import { LinkBase } from '~shared/ui/link-base';

interface CountdownButtonProps {
  onClick: (restart: () => void) => void;
}

export const CountdownButton: FC<CountdownButtonProps> = ({ onClick = () => null }) => {
  const countdownTime = 10;
  const [time, setTime] = useState(countdownTime);

  const startCountdown = () => {
    setTime(countdownTime);

    const startTime = Date.now();

    const interval = setInterval(() => {
      const currentTime = Date.now();
      const timePassed = ((currentTime - startTime) / 1000) | 0;
      const time = countdownTime - timePassed;

      if (time <= 0) {
        setTime(0);
        clearInterval(interval);
      } else {
        setTime(time);
      }
    });
  };

  const handleClick = () => {
    onClick(startCountdown);
  };

  useEffect(() => {
    startCountdown();
  }, []);

  const canSend = time === 0;

  return canSend ? (
    <LinkBase>
      <ReText size="sm" component="span" weight="semibold" onClick={handleClick}>
        Отправить заново
      </ReText>
    </LinkBase>
  ) : (
    <ReText align="center" component="span" size="sm" color="muted-foreground">
      До повторной отправки {time}
    </ReText>
  );
};
