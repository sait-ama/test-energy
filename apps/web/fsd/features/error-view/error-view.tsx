'use client';

import type { CSSProperties, FC, ReactNode } from 'react';

import { Error429 } from '~features/error-view/ui/error-429';

import { Error401, Error404, Error500, ErrorDefault } from './ui';

interface ErrorViewProps {
  status?: number;
  label?: string;
  msg?: string;
  componentStack?: string;
  className?: string;
  style?: CSSProperties;
  withImage?: boolean;
  onReload?: () => void;
  actions?: ReactNode;
}

export const ErrorView: FC<ErrorViewProps> = (props: ErrorViewProps) => {
  const { status = 500, msg, componentStack, withImage, ...rest } = props;

  if (status === 401) {
    return <Error401 text={msg} {...rest} />;
  }

  if (status === 404) {
    return <Error404 text={msg} withImage={withImage} {...rest} />;
  }

  if (status === 429) {
    return <Error429 text={msg} withImage={withImage} {...rest} />;
  }

  if (status >= 500) {
    return (
      <Error500
        status={status}
        text={msg}
        withImage={withImage}
        componentStack={componentStack}
        {...rest}
      />
    );
  }

  return <ErrorDefault status={status} text={msg} {...rest} />;
};
