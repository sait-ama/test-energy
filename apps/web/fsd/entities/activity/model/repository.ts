import { api } from '~shared/api/$api';
import { apiToolkit } from '~shared/api/api-toolkit';
import type {
  Activity,
  ActivityItemParamsSchema,
  ActivityPaginatedListQuerySchema,
  ActivityPaginatedListResponseSchema,
  ActivityTargetQuerySchema,
  CommentSchema,
  LikeCommentRequestSchema,
  PostCommentsTarget,
  ProfileCommentSchema,
  PublisherActivityPaginatedListParamsSchema,
  PublisherActivityPaginatedListResponseSchema,
  PublisherCommentSchema,
  PublisherCommentTarget,
  ReplyCommentTarget,
  RetrieveActivityParamsSchema,
  UserActivityPaginatedListParamsSchema,
  UserActivityPaginatedListResponseSchema,
  UserCommentsTarget,
} from '~shared/api/models/activity';

import { CommentsEndpoints } from './endpoints';

type UnknownFormat<T> = V2ListResponse<T> | T[] | V1Response<T[]>;

const transformToV2 = <T>(res: UnknownFormat<T>): V2ListResponse<T> => {
  if ((res as V1Response<T[]>).content) {
    return { results: (res as V1Response<T[]>).content };
  }

  if (Array.isArray(res)) {
    return { results: res };
  }

  return res as V2ListResponse<T>;
};

const createActivityRouter = apiToolkit(({ api, toolbox }) => ({
  oneToList: toolbox.createMethod<
    ActivityPaginatedListResponseSchema,
    void,
    RetrieveActivityParamsSchema,
    void
  >((variables, opts) =>
    api
      .get<Activity>(CommentsEndpoints.one(variables), opts)
      .then((comment) => ({ results: [comment] }))
  ),
  list: toolbox.createMethod<
    ActivityPaginatedListResponseSchema,
    void,
    void,
    ActivityPaginatedListQuerySchema<ActivityTargetQuerySchema>
  >((variables, opts) =>
    api.get<Activity[]>(CommentsEndpoints.list(variables), opts).then(transformToV2)
  ),
  post: toolbox.createMethod<
    UserActivityPaginatedListResponseSchema,
    void,
    UserActivityPaginatedListParamsSchema,
    ActivityPaginatedListQuerySchema<PostCommentsTarget>
  >((variables, opts) =>
    api
      .get<V1Response<ProfileCommentSchema[]>>(CommentsEndpoints.user(variables), opts)
      .then(transformToV2)
  ),
  user: toolbox.createMethod<
    UserActivityPaginatedListResponseSchema,
    void,
    UserActivityPaginatedListParamsSchema,
    ActivityPaginatedListQuerySchema<UserCommentsTarget>
  >((variables, opts) =>
    api
      .get<V1Response<ProfileCommentSchema[]>>(CommentsEndpoints.user(variables), opts)
      .then(transformToV2)
  ),
  publisher: toolbox.createMethod<
    PublisherActivityPaginatedListResponseSchema,
    void,
    PublisherActivityPaginatedListParamsSchema,
    ActivityPaginatedListQuerySchema<PublisherCommentTarget>
  >((variables, opts) =>
    api.get<V2ListResponse<PublisherCommentSchema>>(CommentsEndpoints.publisher(variables), opts)
  ),
  create: toolbox.createMethod<
    CommentSchema,
    any,
    void,
    ActivityPaginatedListQuerySchema<ActivityTargetQuerySchema>
  >((variables, opts) => api.post(CommentsEndpoints.send(variables), variables.data, opts)),
  reply: toolbox.createMethod<
    CommentSchema,
    any,
    void,
    ActivityPaginatedListQuerySchema<ReplyCommentTarget>
  >((variables, opts) =>
    api.post(CommentsEndpoints.send(variables), { ...variables.data, ...variables.query }, opts)
  ),
  edit: toolbox.createMethod<CommentSchema, Partial<CommentSchema>, ActivityItemParamsSchema, void>(
    (variables, opts) => api.put(CommentsEndpoints.edit(variables), variables.data, opts)
  ),
  like: toolbox.createMethod<CommentSchema, LikeCommentRequestSchema, void, void>(
    (variables, opts) => api.post(CommentsEndpoints.like(), variables.data, opts)
  ),
  del: toolbox.createMethod<CommentSchema, void, ActivityItemParamsSchema, void>(
    (variables, opts) => api.delete(CommentsEndpoints.del(variables), variables.data, opts)
  ),
  ban: toolbox.createMethod<CommentSchema, void, ActivityItemParamsSchema, void>(
    (variables, opts) => api.put(CommentsEndpoints.ban(variables), variables.data, opts)
  ),
}));

export namespace ActivityRepository {
  export const { ban, del, like, reply, edit, list, oneToList, user, create, publisher } =
    createActivityRouter({ api });
}
