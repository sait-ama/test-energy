'use client';
import {
  ComponentProps,
  CSSProperties,
  Dispatch,
  HTMLAttributes,
  lazy,
  memo,
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';
import { useFormatter, useNow, useTranslations } from 'next-intl';

import { PostEntity } from '@re/api/generated/types.gen';
import { createContext } from '@re/core/utils/create-context';
import Comments from '@re/ui-kit/icons/comments';
import Dislike from '@re/ui-kit/icons/dislike';
import Like from '@re/ui-kit/icons/like';
import Pin from '@re/ui-kit/icons/pin';
import { Button, ButtonProps } from '@re/ui-kit/ui/button';
import { Card } from '@re/ui-kit/ui/card';
import { ReText, TextProps } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useContentType } from '~app/providers/site-config-provider';
import { useLikePostActionMutation } from '~entities/post/model/manage-likes/use-like-action-mutation';
import { mergeAuthorsObject, transformPostTextSanitizeConfig } from '~entities/post/model/utils';
import { PostReactionsList } from '~entities/post/ui/post-reactions';
import {
  HorizontalSimpleTitleCard,
  HorizontalSimpleTitleCardProps,
} from '~entities/title/ui/horizontal-simple-title-card';
import { UserAvatar } from '~entities/user/ui/user-avatar';
import { InfoModalType } from '~shared/api/models/info-modal';
import type { PostSchema } from '~shared/api/models/post';
import { LikeDislikeType } from '~shared/api/models/post';
import { Routing, RoutingLinkProps } from '~shared/config/routing';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { useInfoModal } from '~shared/lib/info-modal/use-info-modal';
import { getInitialState, likeDislikeReducer } from '~shared/lib/like-dislike/model/store';
import { logger } from '~shared/lib/logger';
import { sanitizeSync } from '~shared/lib/sanitize/sanitize-sync';
import { useLoggedCheck } from '~shared/lib/session/use-logged';
import { linkBaseVariants } from '~shared/ui/link-base';
import { RichTextExtended } from '~shared/ui/rich-text-extended';
import { decodeHtml } from '~shared/utils/decode-html';
import { getClientDate } from '~shared/utils/get-client-date';
import { SytheticEventPreventer } from '~shared/utils/prevent-default';

const LazyPostActions = lazy(async () =>
  import('./post-actions').then((v) => ({ default: v.PostActionsTrigger }))
);

export const PostCardHeader = ({
  children,
  className,
  ...other
}: {
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex w-full items-center justify-between px-4 pt-4 max-sm:flex-wrap', className)}
    {...other}
  >
    {children}
  </div>
);

export const PostCardContent = ({
  children,
  className,
  href,
  ...other
}: {
  children: ReactNode;
  href?: string;
} & HTMLAttributes<HTMLDivElement>) => {
  const post = usePostStore((v) => v.post);

  const cls = cn('flex flex-col gap-2', className);

  return href && post.dir ? (
    //@ts-ignore
    <Link shallow={false} prefetch={false} className={cls} href={href}>
      {children}
    </Link>
  ) : (
    <div className={cls} {...other}>
      {children}
    </div>
  );
};

export interface PostStore {
  post: PostSchema;
  localMutate?: (id: number, post: Partial<PostSchema>) => Promise<void>;
}

const {
  useStore: usePostStore,
  Provider: PostProvider,
  Consumer: PostConsumer,
} = createContext<
  PostStore & {
    changePost: (post: Partial<PostSchema>) => void;
    setLocalPost: Dispatch<SetStateAction<PostSchema>>;
  },
  PostStore
>((store) => {
  const [localPost, setLocalPost] = useState<PostSchema>(() => store.post);
  const changePost = useCallback((newPost: Partial<PostSchema>) => {
    setLocalPost((post) => ({ ...post, ...newPost }));
  }, []);
  useEffect(() => {
    setLocalPost(store.post);
  }, [store.post]);
  return {
    post: localPost,
    localMutate: store.localMutate,
    changePost,
    setLocalPost,
  };
});

interface PostCardProps extends ComponentProps<'div'> {}

const PostCard = (props: PostCardProps) => {
  const { children, className, ...other } = props;
  const is_banned = usePostStore((v) => v.post.is_banned);
  const is_deleted = usePostStore((v) => v.post.is_deleted);
  const is_pinned = usePostStore((v) => v.post.is_pinned);

  return (
    <Card
      asChild
      variant="ghost"
      className={cn(
        className,
        'cs-post-item',
        'outline-border bg-secondary dark:bg-card relative rounded-md border transition-all',
        { 'opacity-[0.6]': is_banned || is_deleted },
        { 'border-border border-2': is_pinned },
        // { [classes.opacity]: is_banned || is_deleted },
        { 'border-red-500': is_banned }
      )}
      {...other}
    >
      <article>{children}</article>
    </Card>
  );
};

interface PostCardRootProps {
  post: PostEntity;
  localMutate?: (id: number, newPost: Partial<PostSchema>) => Promise<void>;
  children: ReactNode;
}

const PostCardRoot = (props: PostCardRootProps) => {
  const { post, children, localMutate } = props;

  return <PostProvider value={{ post, localMutate }}>{children}</PostProvider>;
};

export interface PostTextProps {
  renderNode?: (attrs: Record<string, string>) => ReactNode;
  className?: string;
  style?: CSSProperties;
}

const PostText = memo(({ style, className, renderNode }: PostTextProps) => {
  const { text } = usePostStore((v) => v.post);

  if (!text) return null;

  const sanitizedText = sanitizeSync(decodeHtml(text), transformPostTextSanitizeConfig);

  return (
    <RichTextExtended
      style={{
        fontSize: '16px',
        overflowWrap: 'anywhere',
        ...style,
        wordBreak: 'break-word',
      }}
      className={className}
      renderNode={renderNode}
    >
      {sanitizedText}
    </RichTextExtended>
  );
});

export interface PostTextOverflowContainer {
  children: ReactNode;
  className?: string;
}

export const PostTextOverflowContainer = ({ children, className }: PostTextOverflowContainer) => {
  const { text } = Post.useContext((v) => v.post);
  const textRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useLayoutEffect(() => {
    if (!textRef.current) return;

    const height = textRef.current.scrollHeight;
    const remInPx = parseFloat(getComputedStyle(textRef.current).fontSize);
    const maxHeight = 9 * remInPx;

    setIsOverflowing(height > maxHeight);
  }, [text]);

  return (
    <div className={cn('pointer-events-none relative', className)}>
      <div ref={textRef} className="max-h-36 overflow-hidden">
        {children}
      </div>
      {isOverflowing ? (
        <div className="from-secondary/60 group:hover pointer-events-none absolute right-0 bottom-0 z-100 h-18 w-full overflow-hidden bg-gradient-to-t to-transparent transition-all transition-opacity duration-300 hover:bg-red-500" />
      ) : null}
    </div>
  );
};

export type PostTitleProps = TextProps;

const PostTitle = memo((props: PostTitleProps) => {
  const { header } = usePostStore((v) => v.post);

  return (
    <ReText size="lg" weight="bold" color="foreground" {...props} lineClamp={2}>
      {header}
    </ReText>
  );
});

export interface PostLinkProps extends RoutingLinkProps {}

const PostLink = memo(({ children, className, ...props }: PostLinkProps) => {
  const { dir } = usePostStore((v) => v.post);

  return (
    <Link
      shallow={false}
      prefetch={false}
      href={Routing.Forum.ByDir.get({ params: { dir } })}
      className={linkBaseVariants({
        variant: 'secondary',
        className: cn('text-primary-foreground hover:text-primary-foreground z-0', className),
      })}
      {...props}
    >
      {children}
    </Link>
  );
});

export interface PostBackgroundLinkProps extends RoutingLinkProps {}

const PostBackgroundLink = memo(({ children, className, ...props }: PostBackgroundLinkProps) => {
  const { dir } = usePostStore((v) => v.post);

  return (
    <Link
      shallow={false}
      prefetch={false}
      href={Routing.Forum.ByDir.get({ params: { dir } })}
      className={cn('absolute inset-0', className)}
      {...props}
    >
      <div className="absolute h-[1px] w-[1px] overflow-hidden">{children}</div>
    </Link>
  );
});

export const PostDate = memo((props: TextProps) => {
  const serverDateString = usePostStore((v) => v.post.created_at);
  const curDate = useNow();
  const date = useFormatter().relativeTime(getClientDate({ serverDateString })!, curDate);

  return (
    <ReText size="xs" color="muted-foreground" align="right" suppressHydrationWarning {...props}>
      {date}
    </ReText>
  );
});

export interface PostAuthorProps extends Omit<RoutingLinkProps, 'children'> {
  renderAuthorType?: (props: { authorTypeFormatted: string }) => ReactNode;
  avatarSize?: number;
}

const PostAuthor = memo((props: PostAuthorProps) => {
  const { className, avatarSize = 40, renderAuthorType: renderAuthorTypeProp, ...rest } = props;

  const post = usePostStore((v) => v.post);
  const { author_publisher, author_club, author_user } = post;
  const {
    name: authorName,
    profileHref,
    img,
    type,
    frame,
  } = mergeAuthorsObject(author_user, author_publisher, author_club);

  const t = useTranslations('pages.forum');

  const authorTypeFormatted = t(`actions.author-type.${type}`);

  return (
    <Link
      target={type === 'user' ? '_blank' : 'inherit'}
      title={authorName}
      className={cn(
        'z-0 flex items-center gap-2',
        linkBaseVariants({ className: 'text-primary-foreground' }),
        className
      )}
      prefetch={false}
      {...rest}
      href={profileHref}
    >
      <UserAvatar
        frameSrc={frame?.high ?? ''}
        size={avatarSize}
        avatarSrc={img?.mid ?? ''}
        alt={authorName}
      />
      <div>
        {renderAuthorTypeProp ? (
          renderAuthorTypeProp({ authorTypeFormatted })
        ) : (
          <ReText color="muted-foreground" lineClamp={1} size="sm" className="leading-none">
            {authorTypeFormatted}
          </ReText>
        )}

        <ReText weight="semibold" lineClamp={1}>
          {authorName}
        </ReText>
      </div>
    </Link>
  );
});

interface PostTagsProps extends ComponentProps<'ul'> {
  maxLength?: number;
}

const PostTags = memo((props: PostTagsProps) => {
  const { className, maxLength, ...rest } = props;
  const tags = usePostStore((v) => v.post.tags || []);

  return (
    <ul className={cn('z-0 flex list-none flex-wrap items-center gap-2', className)} {...rest}>
      {tags
        .slice(0, maxLength ?? tags.length)
        .map(({ name, description, id }) => (
          <li key={id} className="list-none" aria-label={description}>
            {/*<Link*/}
            {/*  prefetch={false}*/}
            {/*  href={Routing.Forum.Feed.get({ query: { tags: [id] } })}*/}
            {/*  className={linkBaseVariants({ className: 'text-primary-foreground z-0' })}*/}
            {/*>*/}
            <ReText size="sm" color="muted-foreground">
              {name}
            </ReText>
            {/*</Link>*/}
          </li>
        ))
        .reduce((acc, curr, i, arr) => acc.concat(curr, i < arr.length - 1 ? '·' : []), [])}
    </ul>
  );
});

interface PostLikeActionProps extends ComponentProps<'div'> {}
const PostLikeActions = memo(({ className, ...props }: PostLikeActionProps) => {
  const post = usePostStore((v) => v.post);
  const { score, id, rated } = post ?? {};
  const { mutateAsync } = useLikePostActionMutation();
  const checkLogged = useLoggedCheck();
  const [localState, dispatch] = useReducer(likeDislikeReducer, getInitialState(rated, score));

  const onLike = checkLogged(async (type: LikeDislikeType) => {
    try {
      dispatch({ type });
      await mutateAsync({ body: { type, post: id } });
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  });

  const { liked, disliked, score: localScore } = localState;

  return (
    <div
      onClick={new SytheticEventPreventer().default().process}
      className={cn('flex items-center gap-2', className)}
      {...props}
    >
      <Button
        variant="ghost"
        className={cn('transition-colors duration-300')}
        onClick={() => {
          onLike(LikeDislikeType.LIKE);
        }}
        size="sm"
        circle
      >
        <Like
          className={cn({ 'fill-current text-red-700': liked }, 'transition-colors duration-300')}
        />
      </Button>
      <ReText size="sm" weight="medium">
        {localScore}
      </ReText>
      <Button
        onClick={() => {
          onLike(LikeDislikeType.DISLIKE);
        }}
        circle
        size="sm"
        variant="ghost"
      >
        <Dislike
          className={cn(
            disliked ? 'fill-current text-red-700' : '[--r-foreground-inverted:--r-foreground]',
            'transition-colors duration-300'
          )}
        />
      </Button>
    </div>
  );
});

interface PostCommentsCounterProps extends ButtonProps {}

const PostCommentsCounter = ({ className, ...props }: PostCommentsCounterProps) => {
  const post = usePostStore((v) => v.post);

  return (
    <Button
      variant="ghost"
      size="sm"
      startIcon={<Comments className="!size-5" />}
      className={cn('px-2', className)}
      {...props}
    >
      <ReText size="sm" weight="medium">
        {post.count_comments}
      </ReText>
    </Button>
  );
};

interface PostStatusProps extends ComponentProps<'div'> {}

export const PostStatus = memo(({ className, ...props }: PostStatusProps) => {
  const { /* is_deleted, is_banned, */ is_pinned } = usePostStore((v) => v.post);

  return (
    <div className={cn('absolute top-2 right-2', className)} {...props}>
      {is_pinned && <Pin aria-label="этот пост закреплён" className="size-4" />}
      {/*{is_banned && <BlockStatus aria-label="этот пост был заблокирован"  />}*/}
      {/*{is_deleted && <Delete aria-label="этот пост удалёен" />}*/}
    </div>
  );
});

interface PostReactionsProps extends ButtonProps {}

export const PostReactions = memo(({ className, ...props }: PostReactionsProps) => {
  const { dir } = usePostStore((v) => v.post);
  const open = useInfoModal((v) => v.open);

  const handleClick = () => {
    open({
      type: InfoModalType.CUSTOM,
      content: <PostReactionsList dir={dir} />,
      srOnly: 'Список реакций',
      contentProps: {
        className: 'sm:max-w-2xl',
      },
    });
  };

  return (
    <Button
      color="secondary"
      size="sm"
      onClick={handleClick}
      className={cn('-mx-1 flex gap-2 self-start')}
      {...props}
    >
      <Like className={cn('fill-current text-red-700 transition-colors duration-300')} />
      реакции
    </Button>
  );
});

interface PostAttachmentProps extends Omit<HorizontalSimpleTitleCardProps, 'model'> {}

const PostAttachment = memo((props: PostAttachmentProps) => {
  const { title } = usePostStore((v) => v.post);
  const contentType = useContentType();

  if (!title) return null;

  return (
    <Link
      href={Routing.Title.detail({ params: { content: contentType, dir: title.dir, tab: 'main' } })}
      className="w-full"
    >
      <HorizontalSimpleTitleCard
        size="sm"
        {...props}
        className={cn('hover:bg-accent/50', props.className)}
        model={title}
      />
    </Link>
  );
});

export const Post = {
  Root: PostCardRoot,
  DataConsumer: PostConsumer,
  Content: PostCardContent,
  useContext: usePostStore,
  Card: PostCard,
  Header: PostCardHeader,
  Text: PostText,
  TextOverflowContainer: PostTextOverflowContainer,
  Title: PostTitle,
  Link: PostLink,
  BackgroundLink: PostBackgroundLink,
  Date: PostDate,
  Author: PostAuthor,
  Actions: LazyPostActions,
  Tags: PostTags,
  LikeActions: PostLikeActions,
  CommentsCounter: PostCommentsCounter,
  Status: PostStatus,
  Reactions: PostReactions,
  Attachment: PostAttachment,
};
