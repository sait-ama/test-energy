'use client';

import { type ComponentPropsWithoutRef } from 'react';

import { ReText } from '@re/ui-kit/ui/text';

import { TestProps } from '~shared/lib/test/utils/test-props';
import { CommentsAsync } from '~widgets/activity/ui/comments.async';

import { useCurrentPageSuspenseTitleDetail } from '../../model/queries';

const CommentsDisabled = () => {
  return (
    <div className="mt-2 rounded-sm py-4" style={{ border: '1px solid var(--bg-input)' }}>
      <ReText size="lg" weight="semibold" className="mb-1.5">
        Комментарии под тайтлом отключены
      </ReText>
      <ReText lineClamp={4} color="muted-foreground">
        Владелец или переводчик решил отключить комментарии под данным тайтлом.
      </ReText>
    </div>
  );
};

export interface TitleCommentsBlockProps extends ComponentPropsWithoutRef<'div'> {}

export const TitleCommentsFragment = (props: TitleCommentsBlockProps) => {
  const { data } = useCurrentPageSuspenseTitleDetail();

  if (!data) return null;

  const canPostComments = data?.can_post_comments;
  const canPinComment = !!data?.meta?.can_pin_comment;

  const titleId = data?.id;

  return (
    <div {...props}>
      {canPostComments ? (
        <CommentsAsync
          canPinComment={canPinComment}
          target={{ title_id: titleId }}
          {...TestProps.id('title-comments-fragment-enabled')}
        />
      ) : (
        <CommentsDisabled {...TestProps.id('title-comments-fragment-disabled')} />
      )}
    </div>
  );
};
