'use server';

import { TitleCommentsFragment } from './fragments/comments';
import { TitleCommentsVisibilityControl } from './_title-comments-block.client';

export interface TitleCommentsBlockProps {
  className?: string;
}

export const TitleCommentsBlock = async (props: TitleCommentsBlockProps) => {
  const { className } = props;

  return (
    <TitleCommentsVisibilityControl className={className}>
      <TitleCommentsFragment />
    </TitleCommentsVisibilityControl>
  );
};
