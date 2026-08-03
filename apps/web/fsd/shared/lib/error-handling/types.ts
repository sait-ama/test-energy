export interface DetailServerErrorRecord {
  message: string;
  code: string;
}

// todo: replace to ApiError, it's incorrect to use TFields as generic here, cause we can have different fields as title.main_name - it is not supported
export interface DetailServerErrors<TFields = 'non_field_errors'> {
  detail:
    | Partial<Record<keyof TFields | 'non_field_errors', DetailServerErrorRecord[]>>
    | DetailServerErrorRecord[]
    | DetailServerErrorRecord;
}
