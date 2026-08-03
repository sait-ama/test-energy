import type { ToolkitEndpointBuilder } from '~shared/api/api-toolkit';
import type {
  ClubListQuerySchema,
  ClubRequestPaginatedListQuerySchema,
  ClubRequestSchemaUpdateParamsSchema,
  ClubsRetrieveParamsSchema,
} from '~shared/api/models/guild-club';
import { UrlBuilder } from '~shared/utils/url-formatter';

export namespace ClubEndpoints {
  /**
   * Список клубов
   */
  export const v2ClubsList: ToolkitEndpointBuilder<void, ClubListQuerySchema> = ({ query }) =>
    new UrlBuilder('/api/v2/clubs/').query(query).build();
  /**
   * Создать клуб
   */
  export const v2ClubsCreate = () => '/api/v2/clubs/';

  /**
   * Информация о клубе
   */
  export const v2ClubRetrieve: ToolkitEndpointBuilder<ClubsRetrieveParamsSchema, void> = ({
    params,
  }) => new UrlBuilder(`/api/v2/clubs/${params?.dir!}/`).build();

  /**
   * Вступить в гильдию или создать заявку на вступление
   */
  export const clubsCreateRequest2Club: ToolkitEndpointBuilder<ClubsRetrieveParamsSchema, void> = ({
    params,
  }) => new UrlBuilder(`/api/v2/clubs/${params?.dir!}/`).build();
  /**
   * Вступить в гильдию или создать заявку на вступление
   */
  export const clubsLeaveClub: ToolkitEndpointBuilder<ClubsRetrieveParamsSchema, void> = ({
    params,
  }) => new UrlBuilder(`/api/v2/clubs/${params?.dir!}/leave/`).build();
  //
  /**
   * Изменть клуб
   */
  export const clubsUpdate: ToolkitEndpointBuilder<ClubsRetrieveParamsSchema, void> = ({
    params,
  }) => new UrlBuilder(`/api/v2/clubs/${params?.dir!}/`).build();
  // export const clubsUpdate = <ThrowOnError extends boolean = false>(options: Options<clubsUpdateData, ThrowOnError>) => {
  //     return (options?.client ?? client).put<clubsUpdateResponse, clubsUpdateError, ThrowOnError>({
  //         ...options,
  //         url: '/api/v2/clubs/{dir}/',
  //     });
  // };
  //
  // export const clubsPartialUpdate = <ThrowOnError extends boolean = false>(options: Options<clubsPartialUpdateData, ThrowOnError>) => {
  //     return (options?.client ?? client).patch<clubsPartialUpdateResponse, clubsPartialUpdateError, ThrowOnError>({
  //         ...options,
  //         url: '/api/v2/clubs/{dir}/',
  //     });
  // };
  //
  /**
   * Создать заявку на удаление клуба/Удалить клуб
   */
  export const clubsDestroy: ToolkitEndpointBuilder<ClubsRetrieveParamsSchema, void> = ({
    params,
  }) => new UrlBuilder(`/api/v2/clubs/${params?.dir!}/`).build();
  //clubsDestroy
  // export const clubsDestroy = <ThrowOnError extends boolean = false>(options: Options<clubsDestroyData, ThrowOnError>) => {
  //     return (options?.client ?? client).delete<clubsDestroyResponse, clubsDestroyError, ThrowOnError>({
  //         ...options,
  //         url: '/api/v2/clubs/{dir}/',
  //     });
  // };
  //
  // /**
  //  * Пожертвовать молнии клубу
  //  */
  export const clubsDonateCreate: ToolkitEndpointBuilder<ClubsRetrieveParamsSchema, void> = ({
    params,
  }) => new UrlBuilder(`/api/v2/clubs/${params?.dir!}/donate/`).build();

  export const clubsRequestsList: ToolkitEndpointBuilder<
    ClubsRetrieveParamsSchema,
    ClubRequestPaginatedListQuerySchema
  > = ({ params, query }) =>
    new UrlBuilder(`/api/v2/clubs/${params?.dir!}/requests/`).query(query).build();

  //
  // export const clubsRequestsRetrieve = <ThrowOnError extends boolean = false>(options: Options<clubsRequestsRetrieveData, ThrowOnError>) => {
  //     return (options?.client ?? client).get<clubsRequestsRetrieveResponse, clubsRequestsRetrieveError, ThrowOnError>({
  //         ...options,
  //         url: '/api/v2/clubs/{dir}/requests/{id}/',
  //     });
  // };
  //
  // /**
  //  * Изменить заявку на вступление в клуб
  //  */
  export const clubsRequestsUpdate: ToolkitEndpointBuilder<
    ClubRequestSchemaUpdateParamsSchema,
    void
  > = ({ params, query }) =>
    new UrlBuilder(`/api/v2/clubs/${params?.dir!}/requests/${params?.id!}/`).query(query).build();

  //
  // export const clubsRequestsPartialUpdate = <ThrowOnError extends boolean = false>(options: Options<clubsRequestsPartialUpdateData, ThrowOnError>) => {
  //     return (options?.client ?? client).patch<clubsRequestsPartialUpdateResponse, clubsRequestsPartialUpdateError, ThrowOnError>({
  //         ...options,
  //         url: '/api/v2/clubs/{dir}/requests/{id}/',
  //     });
  // };
}
