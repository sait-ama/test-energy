import { stringify as s } from 'querystring';

import type { ToolkitEndpointBuilder } from '~shared/api/api-toolkit';
import type { NotificationsGetListQuerySchema } from '~shared/api/models/notifications';
import { UrlBuilder } from '~shared/utils/url-formatter';

export namespace NotificationsEndpoints {
  export interface NotificationsListProps {
    page?: number;
    count?: number;
    status?: 0 | 1;
    type?: 0 | 1 | 2;
  }

  export const list = (query: NotificationsListProps) =>
    `/api/users/notifications/?${s({
      count: 20,
      page: 1,
      ...query,
    })}`;

  export const getList: ToolkitEndpointBuilder<void, NotificationsGetListQuerySchema> = ({
    query,
  }) => new UrlBuilder('/api/users/notifications/').query(query).build();

  export const setReadNotifications: ToolkitEndpointBuilder<void, void> = () =>
    new UrlBuilder('/api/users/notifications/').build();

  export const deleteNotifications: ToolkitEndpointBuilder<void, void> = () =>
    new UrlBuilder('/api/users/notifications/').build();
}
