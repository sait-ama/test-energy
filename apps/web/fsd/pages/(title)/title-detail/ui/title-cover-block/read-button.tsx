'use client';

import { type FC } from 'react';
import Link from 'next/link';

import type { ButtonProps } from '@re/ui-kit/ui/button';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import { useContentType } from '~app/providers/site-config-provider';
import { ContentTypes } from '~shared/config/constants';
import { Routing } from '~shared/config/routing';
import { yaMetrika } from '~shared/lib/metrics/yandex-metrika/metrika';
import { MetrikaGoals } from '~shared/lib/metrics/yandex-metrika/metrika-goals';
import { TestProps } from '~shared/lib/test/utils/test-props';
import { isEmpty } from '~shared/utils/is-empty';

import { useCurrentPageSuspenseTitleDetail } from '../../model/queries';

const ContinueLabel: FC<{ tome: number; chapter: number; page?: number }> = ({
  tome,
  chapter,
  page,
}) => {
  const contentType = useContentType();

  const mainNav = contentType === ContentTypes.SERIES ? 'Сезон' : 'Том';
  const secondaryNav = contentType === ContentTypes.SERIES ? 'Эпизод' : 'Глава';

  return (
    <div className="flex flex-col items-center justify-center">
      <ReText component="span" size="sm" weight="semibold" color="primary-foreground">
        Продолжить
      </ReText>
      <ReText component="span" size="xs" color="primary-foreground">
        {mainNav} {tome} {secondaryNav} {chapter} {page ? `Страница ${page}` : null}
      </ReText>
    </div>
  );
};

export const ReadButton = (props: Omit<ButtonProps, 'children'>) => {
  const { data } = useCurrentPageSuspenseTitleDetail();

  const { count_chapters, current_reading, continue_reading, first_chapter, dir } = data || {};
  const contentType = useContentType();
  const disabled = !count_chapters || !(current_reading || first_chapter);

  const href = () => {
    if (disabled) return '';

    if (!isEmpty(current_reading) && current_reading.last_read_page !== -1) {
      const params = {
        titleDir: dir!,
        content: contentType,
        id: current_reading.id,
      };

      const query = {};

      if (current_reading?.last_read_page) {
        query.page = current_reading.last_read_page;
      }

      return Routing.Chapter.main({ params, query });
    }

    if (!isEmpty(continue_reading)) {
      return Routing.Chapter.main({
        params: {
          titleDir: dir!,
          content: contentType,
          id: continue_reading.id,
        },
        query: {
          page: 1,
        },
      });
    }

    if (!isEmpty(first_chapter)) {
      return Routing.Chapter.main({
        params: {
          titleDir: dir!,
          content: contentType,
          id: first_chapter.id,
        },
        query: {
          page: 1,
        },
      });
    }
    return '';
  };

  const startReadLabel = contentType === ContentTypes.SERIES ? 'Смотреть' : 'Читать';
  const readLabel = contentType === ContentTypes.SERIES ? 'Просмотрено' : 'Прочитано';
  const noChaptersLabel = contentType === ContentTypes.SERIES ? 'Нет серий' : 'Нет глав';

  const getLabel = () => {
    if (current_reading && current_reading.last_read_page !== -1)
      return (
        <ContinueLabel
          tome={current_reading.tome}
          chapter={current_reading.chapter}
          page={current_reading.last_read_page}
        />
      );
    if (continue_reading)
      return <ContinueLabel tome={continue_reading.tome} chapter={continue_reading.chapter} />;
    if (first_chapter) return startReadLabel;
    if (count_chapters) return readLabel;
    return noChaptersLabel;
  };
  const handleClick = () => {
    if (first_chapter) yaMetrika.reachGoal(MetrikaGoals.TitlePage.startReading, { dir });
    if (current_reading) yaMetrika.reachGoal(MetrikaGoals.TitlePage.continueReading, { dir });
  };

  return (
    <Button
      {...TestProps.id(`start_reading_btn`)}
      size="xl"
      asChild
      disabled={disabled}
      onClick={handleClick}
      {...props}
    >
      <Link shallow={false} prefetch={false} href={href()}>
        {getLabel()}
      </Link>
    </Button>
  );
};
