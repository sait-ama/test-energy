import { useState } from 'react';

import { useRouter } from '@bprogress/next';
import dayjs from 'dayjs';

import { useLastChapter } from '~entities/chapter/model/queries';
import { ChapterRepository } from '~entities/chapter/model/repository';
import { useTitleDetail } from '~entities/title/model/queries';
import { useChapterPublishers } from '~features/chapter-form/model/queries';
import type { ChapterUploadState } from '~features/chapter-form/model/store';
import { ChapterAddForm as ChapterAddFormFeature } from '~features/chapter-form/ui/add/chapter-add-form';
import type { ContentTypes } from '~shared/config/constants';
import { Routing } from '~shared/config/routing';
import { logger } from '~shared/lib/logger';

export interface AddChapterFormProps {
  contentType: ContentTypes;
  dir: string;
  branchId: string;
}

export const AddChapterForm = (props: AddChapterFormProps) => {
  'use no memo';

  const { contentType, branchId, dir } = props;

  const { data: lastChapter, isLoading } = useLastChapter({
    variables: { query: { branch_id: branchId } },
  });
  const { data: title, isLoading: isLoading2 } = useTitleDetail({
    variables: { params: { dir } },
  });
  const publishers = useChapterPublishers({ titleDir: dir });

  const [uploadState, setUploadState] = useState<ChapterUploadState>(new Map());

  const router = useRouter();

  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (values: any, onError: any) => {
    setIsPending(true);

    for (let i = 0; i < values.length; i++) {
      const { fields, id } = values[i];

      if (uploadState.get(id) === 'success') continue;

      const value = {
        ...fields,
        ...(fields.pub_date && { pub_date: dayjs(fields.pub_date).format('YYYY-MM-DD H:mm') }),
        branch: branchId,
        title: title?.id,
      };

      try {
        await ChapterRepository.add(
          { data: value },
          {
            onProgress: (progress) => {
              setUploadState((prev) => {
                const newValues = new Map(prev);
                newValues.set(id, progress);

                return newValues;
              });
            },
          }
        );
        setUploadState((prev) => {
          const newValues = new Map(prev);
          newValues.set(id, 'success');

          return newValues;
        });
      } catch (e) {
        logger.error(e);
        await onError(e, id);

        setUploadState((prev) => {
          const newValues = new Map(prev);
          newValues.delete(id);

          return newValues;
        });
        break;
      }

      if (i === values.length - 1)
        router.push(
          Routing.Title.editChapters({
            params: { content: contentType, dir: title?.dir },
          })
        );
    }

    setIsPending(false);
  };

  if (isLoading || isLoading2 || !publishers) return;

  return (
    <ChapterAddFormFeature
      disabled={isPending}
      onSubmit={handleSubmit}
      defaultData={lastChapter}
      contentType={contentType}
      publishers={publishers}
      branchId={branchId}
      uploadState={uploadState}
    />
  );
};
