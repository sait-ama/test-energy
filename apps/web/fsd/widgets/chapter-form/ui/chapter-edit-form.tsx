import { useState } from 'react';
import Link from 'next/link';

import { ReText } from '@re/ui-kit/ui/text';
import { useQueries } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { getChapterKey } from '~entities/chapter/model/queries';
import { ChapterRepository } from '~entities/chapter/model/repository';
import { getTitleDetailKey } from '~entities/title/model/queries';
import { useChapterPublishers } from '~features/chapter-form/model/queries';
import { ChapterEditForm } from '~features/chapter-form/ui/edit/chapter-edit-form';
import type { ContentTypes } from '~shared/config/constants';
import { Routing } from '~shared/config/routing';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { LinkBase } from '~shared/ui/link-base';
import { importToastAsync } from '~shared/ui/toast/toast.async';

export interface EditChapterFormProps {
  contentType: ContentTypes;
  dir: string;
  branchId: string;
  chapterId: string;
}

const SuccessMessage = ({ contentType, dir }: { contentType: ContentTypes; dir: string }) => {
  return (
    <ReText className="inline-flex gap-1">
      Изменения приняты
      <LinkBase variant="secondary">
        <Link
          href={Routing.Title.editChapters({
            params: {
              content: contentType,
              dir: dir,
            },
          })}
        >
          <ReText className="underline">к списку глав</ReText>
        </Link>
      </LinkBase>
    </ReText>
  );
};
export const EditChapterForm = (props: EditChapterFormProps) => {
  const { contentType, branchId /* = 1021 */, dir, chapterId } = props;
  const [
    { data: title, isLoading: isLoadingTitle },
    { data: chapter, isLoading: isLoadingChapter },
  ] = useQueries({
    queries: [
      getTitleDetailKey({
        variables: { params: { dir } },
      }),
      getChapterKey({
        variables: { params: { chapter: chapterId } },
      }),
    ],
  });
  const publishers = useChapterPublishers({ titleDir: dir });

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const handleSubmit = async ({ file, ...values }) => {
    const data = {
      ...values,
      ...(values.pub_date && { pub_date: dayjs(values.pub_date).format('YYYY-MM-DD H:mm') }),
      ...(values.delay_pub_date && {
        delay_pub_date: dayjs(values.delay_pub_date).format('YYYY-MM-DD H:mm'),
      }),
      ...(file && { file }),
      branch: branchId,
      title: title?.id,
    };

    try {
      await ChapterRepository.edit(
        { data, params: { chapter: chapterId } },
        {
          onProgress: (progress) => {
            setUploadProgress(progress);
          },
        }
      );
      await importToastAsync().then((toast) =>
        toast.success(<SuccessMessage contentType={contentType} dir={dir} />)
      );
      // router.push(Routing.Title.detail({ params: { dir, content: contentType, tab: 'main' } }));
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  if (isLoadingChapter || isLoadingTitle || !publishers) return;
  return (
    <ChapterEditForm
      defaultData={chapter}
      onSubmit={handleSubmit}
      contentType={contentType}
      publishers={publishers}
      titleDir={dir}
      uploadProgress={uploadProgress}
    />
  );
};
