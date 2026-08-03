import { queryKit } from '~shared/api/react-query';

export namespace YearSummaryKeys {
  export const personal = queryKit.createQueryKey(() => ['year-summary-personal']);
  export const byUser = queryKit.createQueryKey(() => ['year-summary-personal-byUser']);
  export const all = queryKit.createQueryKey(() => ['year-summary-personal-all']);
}
