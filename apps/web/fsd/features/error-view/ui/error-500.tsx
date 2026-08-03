import type { CSSProperties, FC, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

import { lastEventId } from '@sentry/browser';

import { ReText } from '@re/ui-kit/ui/text';

import { BaseImage } from '~features/error-view/ui/base-image';
import { UrlFormatter } from '~shared/utils/url-formatter';

import { Detail } from './detail';
import { ErrorBase } from './error-base';
import { PrevPageButton } from './prev-page-button';
import { ReloadButton } from './reload-button';

const FeedbackButton = dynamic(() =>
  import('~entities/feedback/ui/feedback').then((m) => ({
    default: m.FeedbackButton,
  }))
);

interface Error500Props {
  status: number;
  label?: string;
  text?: string;
  className?: string;
  style?: CSSProperties;
  componentStack?: ReactNode;
  withImage?: boolean;
  onReload?: () => void;
}

export const Error500: FC<Error500Props> = (props) => {
  const t = useTranslations();

  const {
    text = t('reusable.errors.500.heading'),
    withImage,
    componentStack,
    onReload,
    style,
    ...rest
  } = props;

  // const handleSubmit = (_values: FeedbackFormSchema) => {
  // const eventId = Sentry.captureMessage(values.name, 'error');
  //
  // const userFeedback = {
  //     event_id: eventId,
  //     name: '<NAME>',
  //     email: '<EMAIL>',
  //     comments: values.description,
  // };
  // Sentry.captureUserFeedback(userFeedback);
  // };

  const eventId = lastEventId();

  return (
    <ErrorBase
      text={text}
      image={
        withImage ? (
          <BaseImage width={249} height={372} src={UrlFormatter.media('public/errors/500.webp')} />
        ) : null
      }
      actions={
        <div className="flex flex-col items-center justify-center gap-4 select-none sm:gap-2">
          <PrevPageButton color="gray" style={{ width: 176 }} /> {t('reusable.conjunctions.or')}
          <ReloadButton style={{ width: 176 }} onReload={onReload} />
        </div>
      }
      footer={
        <div className="mt-4 flex flex-col items-center">
          <ReText align="center" className="mb-4 max-w-[300px]">
            {t('reusable.errors.500.bug-report.report-by-feedback')}
          </ReText>
          <FeedbackButton />
          {componentStack ? (
            <div className="mb-4">
              <ReText align="center" className="my-4">
                {t('reusable.conjunctions.or')}
              </ReText>
              <ReText align="center">
                {t('reusable.errors.500.bug-report.report-by-support')}
              </ReText>
              <Detail
                text={t('reusable.errors.500.bug-report.report-by-support-help')}
                content={`${eventId ? `\nTraceId: ${eventId}\n` : ''}${JSON.stringify(componentStack)}`}
              />
            </div>
          ) : null}
        </div>
      }
      style={withImage ? { paddingTop: '210px', ...style } : style}
      {...rest}
    />
  );
};
