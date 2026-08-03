import { NotificationsEndpoints } from '~entities/notification/model/endpoints';
import { api } from '~shared/api/$api';
import { apiToolkit } from '~shared/api/api-toolkit';
import type {
  NotificationsDeleteRequestSchema,
  NotificationsGetListQuerySchema,
  NotificationsGetListResponseSchema,
  NotificationsSetReadedRequestSchema,
} from '~shared/api/models/notifications';

const createNotificationRouter = apiToolkit(({ api, toolbox }) => ({
  getList: toolbox.createMethod<
    NotificationsGetListResponseSchema,
    void,
    void,
    NotificationsGetListQuerySchema
  >((variables, opts) => api.get(NotificationsEndpoints.getList(variables), opts)),
  setReadNotifications: toolbox.createMethod<void, NotificationsSetReadedRequestSchema, void, void>(
    (variables, opts) =>
      api.put(NotificationsEndpoints.setReadNotifications(variables), variables.data, opts)
  ),

  deleteNotifications: toolbox.createMethod<void, NotificationsDeleteRequestSchema, void, void>(
    (variables, opts) =>
      api.delete(NotificationsEndpoints.deleteNotifications(variables), variables.data, opts)
  ),
}));

export namespace NotificationRepository {
  export const { getList, setReadNotifications, deleteNotifications } = createNotificationRouter({
    api,
  });
}
