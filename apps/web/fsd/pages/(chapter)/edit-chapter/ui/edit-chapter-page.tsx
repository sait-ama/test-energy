'use client';

import { useParams, useSearchParams } from 'next/navigation';

import { useContentType } from '~app/providers/site-config-provider';
import { UnloggedBoundary } from '~shared/lib/auth/unlogged-boundary';
import { Container } from '~shared/ui/container';
import { EditChapterForm } from '~widgets/chapter-form/ui/chapter-edit-form';

export const EditChapterPage = () => {
  const contentType = useContentType();

  const params = useParams<{ dir: string; chapterId: string }>();
  const searchParams = useSearchParams();

  const { dir, chapterId } = params;
  const branchId = searchParams.get('branch');

  if (!branchId) return null;

  return (
    <UnloggedBoundary>
      <Container slim className="mt-5">
        <EditChapterForm
          contentType={contentType}
          dir={dir}
          chapterId={chapterId}
          branchId={branchId}
        />
      </Container>
    </UnloggedBoundary>
  );
};
