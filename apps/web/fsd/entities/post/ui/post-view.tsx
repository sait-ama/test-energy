'use client';
import { ComponentProps, memo, ReactNode } from 'react';
import React from 'react';

import { cn } from '@re/ui-kit/utils/cn';

import { Post } from '~entities/post/ui/post-card';

export interface PostViewProps extends Omit<ComponentProps<'div'>, 'title' | 'content'> {
  prepend?: ReactNode;
  footer?: ReactNode;
  attachment?: ReactNode;
  content?: ReactNode;
  author?: ReactNode;
  actions?: ReactNode;
  title?: ReactNode;
}

export const PostView = memo(
  ({
    footer,
    className,
    attachment,
    actions,
    content,
    title,
    author,
    ref,
    prepend,
    ...props
  }: PostViewProps) => {
    return (
      <Post.Card
        {...props}
        ref={ref}
        className={cn('relative flex flex-col gap-2 p-4 pb-2', className)}
      >
        {prepend}
        <Post.Status />
        <Post.Header className="mb-2 p-0">
          {author}
          {actions}
        </Post.Header>
        <Post.Content>
          {title}
          {content}
        </Post.Content>
        {attachment}
        {footer}
      </Post.Card>
    );
  }
);
