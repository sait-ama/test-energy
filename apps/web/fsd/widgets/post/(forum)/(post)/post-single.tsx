'use client';

import { ErrorBoundary } from 'react-error-boundary';

import { PostEntity } from '@re/api/generated/types.gen';

import { ImageAttachment } from '~entities/post/ui/post-attachment';
import { Post } from '~entities/post/ui/post-card';
import { PostView } from '~entities/post/ui/post-view';
import { transformPostAttachments } from '~entities/post-attachment/model/utils';
import { imagePreview } from '~shared/lib/multy-image-preview/model/image-preview-store';
import { UrlFormatter } from '~shared/utils/url-formatter';
import { PostComments } from '~widgets/post/(forum)/(post)/post-comments';

import { PostRichTextEntitesResolver } from './post-rich-text-entities-resolver';

export type PostSingleProps = {
  model: PostEntity;
};

export const PostSingle = ({ model: post }: PostSingleProps) => {
  const url = UrlFormatter.media(post?.attachment?.high);
  return (
    <div className="flex w-full flex-col gap-2">
      <Post.Root post={post}>
        <PostView
          title={<Post.Title />}
          content={
            <>
              <Post.Text
                renderNode={(schema) => (
                  <ErrorBoundary fallback={null}>
                    <PostRichTextEntitesResolver
                      schema={schema}
                      attachments={transformPostAttachments(post?.attachments)}
                    />
                  </ErrorBoundary>
                )}
              />
              <Post.Attachment />
            </>
          }
          author={<Post.Author />}
          actions={
            <div className="flex shrink-0 items-center gap-2 self-end">
              <Post.Date />
              <Post.Actions />
            </div>
          }
          attachment={
            <div className="mt-2">
              <ImageAttachment
                className="cursor-pointer"
                url={url}
                onClick={() => imagePreview.open(url, { alt: post.header || 'Изображение поста' })}
              />
            </div>
          }
          footer={
            <div className="flex flex-col gap-2">
              <Post.Reactions />
              <div className="flex w-full justify-between">
                <Post.LikeActions />
                <Post.Tags />
              </div>
            </div>
          }
        />
        <PostComments />
      </Post.Root>
    </div>
  );
};
