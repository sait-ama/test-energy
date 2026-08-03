export namespace CreatorEndpoints {
  export const creator = (variables) => `/api/v2/titles/creators/${variables.params!.id}/`;

  export const updateCreator = (variables) =>
    `/api/v2/titles/creators/${variables.params.creatorId}/`;

  export const createCreator = () => `/api/v2/titles/creators/`;
}
