import { ClubEndpoints } from '~entities/guild/api/endpoints';
import { api } from '~shared/api/$api';
import { apiToolkit } from '~shared/api/api-toolkit';
import type {
  ClubCreateUpdateRequestSchema,
  ClubCreateUpdateResponseSchema,
  ClubDetailSchema,
  ClubExpDonateAPIViewCreateRequestSchema,
  ClubListQuerySchema,
  ClubListResponseSchema,
  ClubRequestPaginatedListQuerySchema,
  ClubRequestPaginatedListResponseSchema,
  ClubRequestSchemaUpdateParamsSchema,
  ClubRequestSchemaUpdateRequestSchema,
  ClubsRetrieveParamsSchema,
} from '~shared/api/models/guild-club';

const createRouter = apiToolkit(({ api, toolbox }) => ({
  /**
     список клубов
     **/
  clubsList: toolbox.createMethod<ClubListResponseSchema, void, void, ClubListQuerySchema>(
    (variables, opts) => api.get(ClubEndpoints.v2ClubsList(variables), opts)
  ),
  /**
     Создать клуб
     **/
  clubsCreate: toolbox.createMethod<
    ClubCreateUpdateResponseSchema,
    ClubCreateUpdateRequestSchema,
    void,
    void
  >(({ data }) => api.post(ClubEndpoints.v2ClubsCreate(), data)),

  /**
   * Информация о клубе
   */
  clubsRetrieve: toolbox.createMethod<ClubDetailSchema, void, ClubsRetrieveParamsSchema, void>(
    (variables, opts) => api.get(ClubEndpoints.v2ClubRetrieve(variables), opts)
  ),

  /**
   * Вступить в клуб или создать заявку на вступление
   */
  clubsCreateRequest2Club: toolbox.createMethod<
    ClubDetailSchema,
    void,
    ClubsRetrieveParamsSchema,
    void
  >((variables, opts) => api.post(ClubEndpoints.clubsCreateRequest2Club(variables), {}, opts)),
  /**
   * Вступить в клуб или создать заявку на вступление
   */
  clubsLeaveClub: toolbox.createMethod<
    ClubDetailSchema,
    { password: string },
    ClubsRetrieveParamsSchema,
    void
  >((variables, opts) => api.post(ClubEndpoints.clubsLeaveClub(variables), {}, opts)),

  /**
   * Изменть клуб
   */
  clubsUpdate: toolbox.createMethod<
    ClubCreateUpdateResponseSchema,
    ClubCreateUpdateRequestSchema,
    ClubsRetrieveParamsSchema,
    void
  >((variables, opts) => api.put(ClubEndpoints.clubsUpdate(variables), variables.data, opts)),

  // clubsPartialUpdate: toolbox.createMethod<void, void, clubsRetrieveParamsSchema, void>((variables) => api.get('')),

  /**
   * Создать заявку на удаление клуба/Удалить клуб
   */
  clubsDestroy: toolbox.createMethod<void, { password: string }, ClubsRetrieveParamsSchema, void>(
    (variables, opts) => api.delete(ClubEndpoints.clubsDestroy(variables), variables.data, opts)
  ),

  // clubsDestroy: toolbox.createMethod<clubsDestroyData>(() => api.delete('')),

  /**
   * Пожертвовать молнии клубу
   */
  clubsDonateCreate: toolbox.createMethod<
    void,
    ClubExpDonateAPIViewCreateRequestSchema,
    ClubsRetrieveParamsSchema,
    void
  >((variables, opts) =>
    api.post(ClubEndpoints.clubsDonateCreate(variables), variables.data, opts)
  ),
  /**
   * Список заявок на вступление для модера/админа и создателями
   **/
  clubsRequestsList: toolbox.createMethod<
    ClubRequestPaginatedListResponseSchema,
    void,
    ClubsRetrieveParamsSchema,
    ClubRequestPaginatedListQuerySchema
  >((variables, opts) => api.get(ClubEndpoints.clubsRequestsList(variables), opts)),

  /**
   * Изменить заявку на вступление в клуб
   */
  clubsRequestsUpdate: toolbox.createMethod<
    void,
    ClubRequestSchemaUpdateRequestSchema,
    ClubRequestSchemaUpdateParamsSchema,
    void
  >((variables, opts) =>
    api.put(ClubEndpoints.clubsRequestsUpdate(variables), variables.data, opts)
  ),
}));
// @ts-ignore
export const ClubRepository = createRouter({ api });
