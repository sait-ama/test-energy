'use client';
import type { CSSProperties, FC } from 'react';
import { useTranslations } from 'next-intl';

import { AuthButton } from './auth-button';
import { ErrorBase } from './error-base';

interface Error401Props {
  text?: string;
  className?: string;
  style?: CSSProperties;
  withImage?: boolean;
}

export const Error401: FC<Error401Props> = (props) => {
  const t = useTranslations('reusable.errors.401');

  const { text = t('heading'), withImage, ...rest } = props;

  return <ErrorBase status={401} text={text} actions={<AuthButton />} {...rest} />;
};
