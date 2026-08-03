import { memo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { PostEntity } from '@re/api/generated/types.gen';
import { ReText } from '@re/ui-kit/ui/text';

import { ImageAttachment } from '~entities/post/ui/post-attachment';
import { Post } from '~entities/post/ui/post-card';
import { PostView, PostViewProps } from '~entities/post/ui/post-view';
import { transformPostAttachments } from '~entities/post-attachment/model/utils';
import { useOpen } from '~shared/hooks/use-open';
import { imagePreview } from '~shared/lib/multy-image-preview/model/image-preview-store';
import { UrlFormatter } from '~shared/utils/url-formatter';
import { PostComments } from '~widgets/post/(forum)/(post)/post-comments';

import { PostRichTextEntitesResolver } from './post-rich-text-entities-resolver';

const PostFooter = memo(() => {
  const [open, toggle] = useOpen(false);
  return (
    <div className="z-[2] flex flex-col gap-2">
      <div className="flex w-full flex-col md:flex-row-reverse md:items-center md:justify-between">
        <Post.Tags />
        <div className="flex gap-1">
          <Post.LikeActions />
          <Post.CommentsCounter
            onClick={toggle}
            className={open ? 'text-primary hover:text-primary' : ''}
          />
        </div>
      </div>
      {open && <PostComments />}
    </div>
  );
});

export const PostPreview = memo(
  ({
    post,
    withEntityAttachment = true,
    ...other
  }: PostViewProps & {
    post: PostEntity;
    withEntityAttachment?: boolean;
  }) => (
    <Post.Root post={post} {...other}>
      <PostView
        className="group dark:hover:bg-accent/60 overflow-hidden transition-all dark:hover:shadow-none"
        prepend={
          <>
            <Post.BackgroundLink className="cursor-pointer">
              <Post.Title />
            </Post.BackgroundLink>
          </>
        }
        title={
          <Post.Link className="z-0">
            <Post.Title />
          </Post.Link>
        }
        content={
          <>
            <Post.TextOverflowContainer>
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
            </Post.TextOverflowContainer>
            {withEntityAttachment ? (
              <div className="z-0 mt-2 flex flex-row gap-2">
                <Post.Attachment />
              </div>
            ) : null}
          </>
        }
        author={
          <Post.Author
            renderAuthorType={({ authorTypeFormatted }) => (
              <div className="text-muted-foreground flex items-center gap-2">
                <ReText color="muted-foreground" lineClamp={1} size="sm" className="leading-none">
                  {authorTypeFormatted}
                </ReText>
                • <Post.Date component="span" align={undefined} />
              </div>
            )}
          />
        }
        actions={
          <div className="flex shrink-0 items-center gap-2 self-start">
            <Post.Actions />
          </div>
        }
        attachment={
          <ImageAttachment
            className="cursor-pointer"
            url={UrlFormatter.media(post?.attachment?.high)}
            onClick={() => {
              const imageUrl = UrlFormatter.media(post?.attachment?.high);
              if (imageUrl) {
                imagePreview.open(imageUrl, {
                  alt: post.header || 'Изображение поста',
                });
              }
            }}
          />
        }
        footer={<PostFooter />}
      />
    </Post.Root>
  )
);

PostPreview.displayName = 'PostPreview';
