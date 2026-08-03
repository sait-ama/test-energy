import { useMutation } from '@tanstack/react-query';

import { v2ForumBanCreateMutation } from '@re/api/generated/@tanstack/react-query.gen';

import { getOptimisticPostPaginatedListUpdate } from '~entities/post/model/mutations';
import { Post } from '~entities/post/ui/post-card';
import { client } from '~shared/api/client';

export const useBan = () => {
  const postId = Post.useContext((v) => v.post.id);
  const postDir = Post.useContext((v) => v.post.dir);
  const is_banned = Post.useContext((v) => v.post.is_banned);
  const localUpdate = Post.useContext((v) => v.setLocalPost);
  return useMutation({
    ...v2ForumBanCreateMutation({ client: client, path: { dir: postDir } }),
    onSuccess: async () => {
      await getOptimisticPostPaginatedListUpdate({
        updater: (post) => ({ ...post, is_banned: !is_banned }),
        localUpdate,
        postDir,
        postId,
      })();
    },
  });
};
