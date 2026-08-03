'use client';
import { useParams } from 'next/navigation';

import { cn } from '@re/ui-kit/utils/cn';

import { useTourItem } from '~shared/lib/tour/items';
import { Section, SectionTitle } from '~shared/ui/section';
import { CommentsAsync } from '~widgets/activity/ui/comments.async';

export const CommentsSection = ({ className }: { className?: string }) => {
  const { id } = useParams<{ id: string }>();

  const commentsTourProps = useTourItem('user-detail-about-comments');

  return (
    <Section
      className={cn('bg-card dark:bg-card cs-comments-section', className)}
      {...commentsTourProps}
    >
      <SectionTitle>Комментарии</SectionTitle>
      <CommentsAsync
        target={{
          profile_id: id,
        }}
      />
    </Section>
  );
};
