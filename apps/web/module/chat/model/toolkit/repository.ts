import { xhr } from '~entities/chapter/model/utils';
import { api } from '~shared/api/$api';
import { apiToolkit } from '~shared/api/api-toolkit';

import { ChannelSchema, MessageSchema, RestMessageSchema } from '../types';
import { ChatEndpoints } from './endpoints';
import { sortChannelsByLastMessageDt, transformChatRoomMessageListResponse } from './serializers';
import {
  ChangeChannelRequestSchema,
  ChangeChannelResponseSchema,
  ChannelByIdParamsSchema,
  ChannelMessagesPaginatedListParamsSchema,
  ChannelMessagesPaginatedListQuerySchema,
  ChannelMessagesPaginatedListResponseSchema,
  CreateChannelRequestSchema,
  CreateChannelResponseSchema,
  GetChannelsPaginatedListQuerySchema,
  GetMessageByIdParamsSchema,
  GetPrivateChatWithUserParamsSchema,
  GetPrivateChatWithUserQuerySchema,
  RemoveMemberRequestSchema,
  UpdateMemberRequestSchema,
  UpdateMemberResponseSchema,
  UpdateMessageRequestSchema,
  UpdateMessageResponseSchema,
} from './types';

type Serializer<T, R> = (data: T) => R;

const createSerializedMethod = <T, R>(
  method: (...args: unknown[]) => Promise<T>,
  serializer?: Serializer<T, R>
) => {
  return async (...args: unknown[]): Promise<R> => {
    const response = await method(...args);
    return serializer ? serializer(response) : (response as unknown as R);
  };
};

const createChatRouter = apiToolkit(({ api, toolbox }) => ({
  getChannelById: toolbox.createMethod<ChannelSchema, void, ChannelByIdParamsSchema, void>(
    (variables, opts) => api.get(ChatEndpoints.Channel.byId({ params: variables.params }), opts)
  ),
  getChannels: toolbox.createMethod<
    ChannelSchema[],
    void,
    void,
    GetChannelsPaginatedListQuerySchema
  >((variables, opts) => api.get(ChatEndpoints.Channel.list({ query: variables.query }), opts)),
  createChannel: toolbox.createMethod<
    CreateChannelResponseSchema,
    CreateChannelRequestSchema,
    void,
    void
  >(({ params, data }, opts) =>
    // @ts-expect-error
    xhr({ method: 'POST', url: ChatEndpoints.Channel.create({ params }), data, options: opts })
  ),
  changeChannel: toolbox.createMethod<
    ChangeChannelResponseSchema,
    ChangeChannelRequestSchema,
    ChannelByIdParamsSchema,
    void
  >(({ params, data }, opts) =>
    // @ts-expect-error
    xhr({ method: 'PATCH', url: ChatEndpoints.Channel.change({ params }), data, options: opts })
  ),
  removeChannel: toolbox.createMethod<void, void, ChannelByIdParamsSchema, void>(
    ({ params }, opts) => api.delete(ChatEndpoints.Channel.remove({ params }), {}, opts)
  ),
  leaveChannel: toolbox.createMethod<void, void, ChannelByIdParamsSchema, void>(
    ({ params }, opts) => api.post(ChatEndpoints.Channel.leave({ params }), {}, opts)
  ),
  messagesList: toolbox.createMethod<
    ChannelMessagesPaginatedListResponseSchema<RestMessageSchema>,
    void,
    ChannelMessagesPaginatedListParamsSchema,
    ChannelMessagesPaginatedListQuerySchema
  >((variables, opts) => api.get(ChatEndpoints.Messages.list(variables), opts)),
  uploadFile: toolbox.createMethod<any, FormData, void, void>(({ data }, opts) =>
    // @ts-expect-error
    xhr({ method: 'POST', url: ChatEndpoints.Upload.file({}), data, options: opts })
  ),
  getPrivateChatWithUser: toolbox.createMethod<
    ChannelSchema,
    void,
    GetPrivateChatWithUserParamsSchema,
    GetPrivateChatWithUserQuerySchema
  >((variables, opts) => api.get(ChatEndpoints.Channel.getPrivateChatWithUser(variables), opts)),
  inviteMember: toolbox.createMethod<
    UpdateMemberResponseSchema,
    UpdateMemberRequestSchema,
    ChannelByIdParamsSchema,
    void
  >((variables, opts) => api.post(ChatEndpoints.Member.invite(variables), variables.data, opts)),
  changeMember: toolbox.createMethod<
    UpdateMemberResponseSchema,
    UpdateMemberRequestSchema,
    ChannelByIdParamsSchema,
    void
  >((variables, opts) => api.put(ChatEndpoints.Member.change(variables), variables.data, opts)),
  removeMember: toolbox.createMethod<
    void,
    RemoveMemberRequestSchema,
    ChannelByIdParamsSchema,
    void
  >((variables, opts) => api.delete(ChatEndpoints.Member.remove(variables), variables.data, opts)),
  messageById: toolbox.createMethod<MessageSchema, void, GetMessageByIdParamsSchema, void>(
    (variables, opts) => api.get(ChatEndpoints.Messages.byUuid(variables), opts)
  ),
  editMessage: toolbox.createMethod<
    UpdateMessageResponseSchema,
    UpdateMessageRequestSchema,
    GetMessageByIdParamsSchema,
    void
  >((variables, opts) => api.put(ChatEndpoints.Messages.byUuid(variables), variables.data, opts)),
  removeMessage: toolbox.createMethod<void, void, GetMessageByIdParamsSchema, void>(
    (variables, opts) => api.delete(ChatEndpoints.Messages.byUuid(variables), {}, opts)
  ),
}));

const router = createChatRouter({ api });

const serializedRouter = {
  getChannelById: router.getChannelById,
  getChannels: createSerializedMethod(router.getChannels, sortChannelsByLastMessageDt),
  messagesList: createSerializedMethod(router.messagesList, transformChatRoomMessageListResponse),
  getPrivateChatWithUser: router.getPrivateChatWithUser,
  createChannel: router.createChannel,
  removeChannel: router.removeChannel,
  leaveChannel: router.leaveChannel,
  changeChannel: router.changeChannel,
  inviteMember: router.inviteMember,
  changeMember: router.changeMember,
  removeMember: router.removeMember,
  messageById: router.messageById,
  editMessage: router.editMessage,
  removeMessage: router.removeMessage,
  uploadFile: router.uploadFile,
};

export namespace ChatRepository {
  export namespace Channel {
    export const byId = serializedRouter.getChannelById;
    export const list = serializedRouter.getChannels;
    export const create = serializedRouter.createChannel;
    export const remove = serializedRouter.removeChannel;
    export const leave = serializedRouter.leaveChannel;
    export const change = serializedRouter.changeChannel;
    export const getPrivateChatWithUser = serializedRouter.getPrivateChatWithUser;
  }
  export namespace Member {
    export const invite = serializedRouter.inviteMember;
    export const change = serializedRouter.changeMember;
    export const remove = serializedRouter.removeMember;
  }
  export namespace Messages {
    export namespace MessageById {
      export const get = serializedRouter.messageById;
      export const change = serializedRouter.editMessage;
      export const remove = serializedRouter.removeMessage;
    }
    export const messages = serializedRouter.messagesList;
  }
  export namespace Upload {
    export const file = serializedRouter.uploadFile;
  }
}
