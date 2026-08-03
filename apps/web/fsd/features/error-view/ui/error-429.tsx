import type { CSSProperties, FC } from 'react';
import { useTranslations } from 'next-intl';

import { BaseImage } from '~features/error-view/ui/base-image';
import { ReloadButton } from '~features/error-view/ui/reload-button';
import { UrlFormatter } from '~shared/utils/url-formatter';

import { ErrorBase } from './error-base';

interface Error429Props {
  text?: string;
  className?: string;
  style?: CSSProperties;
  withImage?: boolean;
}

export const Error429: FC<Error429Props> = (props) => {
  const t = useTranslations('reusable.errors.429');

  const { text = t('heading'), withImage = true, style, ...rest } = props;

  return (
    <ErrorBase
      status={429}
      text={text}
      image={
        withImage ? (
          <BaseImage width={288} height={358} src={UrlFormatter.media('public/errors/429.webp')} />
        ) : null
      }
      actions={<ReloadButton />}
      style={withImage ? { paddingTop: '190px', ...style } : style}
      {...rest}
    />
  );
};
