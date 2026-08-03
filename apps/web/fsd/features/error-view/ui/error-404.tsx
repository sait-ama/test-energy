import type { CSSProperties, FC } from 'react';
import { useTranslations } from 'next-intl';

import { BaseImage } from '~features/error-view/ui/base-image';
import { UrlFormatter } from '~shared/utils/url-formatter';

import { ErrorBase } from './error-base';
import { PrevPageButton } from './prev-page-button';

interface Error404Props {
  text?: string;
  className?: string;
  style?: CSSProperties;
  withImage?: boolean;
}

export const Error404: FC<Error404Props> = (props) => {
  const t = useTranslations('reusable.errors.404');

  const { text = t('heading'), withImage, style, ...rest } = props;

  return (
    <ErrorBase
      status={404}
      text={text}
      image={
        withImage ? (
          <BaseImage width={288} height={358} src={UrlFormatter.media('public/errors/404.webp')} />
        ) : null
      }
      actions={<PrevPageButton />}
      style={withImage ? { paddingTop: '190px', ...style } : style}
      {...rest}
    />
  );
};
