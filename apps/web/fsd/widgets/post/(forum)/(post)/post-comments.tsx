'use client';

import * as React from 'react';

import { Post } from '~entities/post/ui/post-card';
import { PostCommentsAsync } from '~widgets/activity/ui/post-comments.async';

export const PostComments = () => {
  const postId = Post.useContext((v) => v?.post?.id);
  const canPinComment = Post.useContext((v) => v?.post?.can_pin_comment);

  if (!postId) return null;

  return <PostCommentsAsync target={{ post_id: postId }} canPinComment={!!canPinComment} />;
};
