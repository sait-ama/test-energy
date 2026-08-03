import { useMutation } from '@tanstack/react-query';

import { v2ForumUpdateMutation } from '@re/api/generated/@tanstack/react-query.gen';

import { getOptimisticPostPaginatedListUpdate } from '~entities/post/model/mutations';
import { Post } from '~entities/post/ui/post-card';
import { client } from '~shared/api/client';

export const useUpdatePost = () => {
  const postId = Post.useContext((v) => v.post.id);
  const postDir = Post.useContext((v) => v.post.dir);
  const localUpdate = Post.useContext((v) => v.setLocalPost);

  return useMutation({
    ...v2ForumUpdateMutation({ client, path: { dir: postDir } }),
    onSuccess: async (data) => {
      await getOptimisticPostPaginatedListUpdate({
        updater: (post) => ({ ...post, ...data }),
        localUpdate,
        postDir,
        postId,
      })();
    },
  });
};
