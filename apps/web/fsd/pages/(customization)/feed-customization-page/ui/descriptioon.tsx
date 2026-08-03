import type { ComponentPropsWithRef } from 'react';

import { ReText } from '@re/ui-kit/ui/text';

import { Underline } from '~shared/ui/underline';

export const Description = (props: ComponentPropsWithRef<'div'>) => {
  return (
    <div className="flex flex-col items-start" {...props}>
      <Underline className="self-start">
        <ReText
          size="2xl"
          component="h2"
          weight="semibold"
          className="dark:text-muted-foreground text-primary-foreground"
        >
          Магазин
        </ReText>
      </Underline>
      <ReText
        className="dark:text-muted-foreground text-primary-foreground mt-3"
        size="xs"
        component="h2"
      >
        Здесь можно приобрести интересующие предметы кастомизации профиля и не только
      </ReText>
    </div>
  );
};
