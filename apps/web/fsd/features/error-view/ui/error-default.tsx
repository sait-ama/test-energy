import type { CSSProperties, FC } from 'react';
import { useTranslations } from 'next-intl';

import { ErrorBase } from './error-base';
import { PrevPageButton } from './prev-page-button';

interface ErrorDefaultProps {
  status: number;
  text?: string;
  className?: string;
  style?: CSSProperties;
}

export const ErrorDefault: FC<ErrorDefaultProps> = (props) => {
  const t = useTranslations('reusable.errors.499');

  const { text = t('heading'), ...rest } = props;

  return <ErrorBase text={text} actions={<PrevPageButton />} {...rest} />;
};
