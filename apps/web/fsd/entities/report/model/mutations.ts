import type { DefaultError } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import type {
  CreateReportRequestSchema,
  CreateReportResponseSchema,
} from '~shared/api/models/panel';

import { ReportRepository } from './repository';

export const useSendReport = () =>
  useMutation<CreateReportResponseSchema, DefaultError, CreateReportRequestSchema>({
    mutationFn: (data) => ReportRepository.send({ data }),
  });
