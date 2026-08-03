'use client';

import { useParams, useSearchParams } from 'next/navigation';

import { useContentType } from '~app/providers/site-config-provider';
import { UnloggedBoundary } from '~shared/lib/auth/unlogged-boundary';
import { Container } from '~shared/ui/container';
import { AddChapterForm } from '~widgets/chapter-form/ui/chapter-add-form';

export const AddChapterPage = () => {
  const contentType = useContentType();

  const params = useParams<{ dir: string }>();
  const searchParams = useSearchParams();

  const { dir } = params;
  const branchId = searchParams.get('branch');

  if (!branchId) return null;

  return (
    <UnloggedBoundary>
      <Container slim className="mt-5">
        <AddChapterForm contentType={contentType} dir={dir} branchId={branchId} />
      </Container>
    </UnloggedBoundary>
  );
};
