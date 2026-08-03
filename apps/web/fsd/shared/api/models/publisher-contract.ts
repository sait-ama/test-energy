import type { Type } from '~shared/api/models/forms';
import type { ContractAgreementStage, PublisherId } from '~shared/api/models/publisher';

export enum CollaborationType {
  /**
   * Физ.лицо.
   */
  'NATURAL_PERSON' = 1,
  /**
   * ИП.
   */
  'IndividualEntrepreneur',
  /**
   * ООО.
   */
  'LLC',
  /**
   * Самозанятый.
   */
  'SELF_EMPLOYED',
}

export interface CollaborationTypesResponseSchema {
  collaboration_types: Record<`${number}`, string>;
}

export interface CollaborationTypesQuerySchema {
  country?: number;
}

export type NationalityResponseSchema = Record<`${number}`, string>;

/**
 * backend info.
 */
export type NATIONALITY = number;

export enum StatusEnum {
  UNACCEPTED,
  GOOD = 1,
  SOME_TROUBLES,
}

export const STATUSES_LABELS = {
  [StatusEnum.UNACCEPTED]: 'Не подтвержден',
  [StatusEnum.GOOD]: 'Подтверждён',
  [StatusEnum.SOME_TROUBLES]: 'Есть проблемы',
};

export type PublisherAgreementStage = ContractAgreementStage;

export type PublisherContractFormItemTypeSchema = 'text' | 'select' | 'date' | 'object';
export interface PublisherContractFormItemSchema {
  field: string;
  label: string;
  help_text: string;
  type: PublisherContractFormItemTypeSchema;
  items: Type[] | null;
  required: boolean;
  value: string | null;
}
export interface PublisherContractFormSchema {
  results: PublisherContractFormItemSchema[];
}

export interface PublisherContractSchema {
  results: {
    user: number;
    collaboration_type: CollaborationType;
    nationality: NATIONALITY;
    first_name: string;
    last_name: string;
    middle_name: string;
    passport: string;
    birthday: string;
    email: string;
    company_name: string;
    inn: string;
    ogrnip: string;
    registration_address: string;
    mail_address: string;
    bank_name: string;
    bank_correspondent_account: string;
    bank_bic: string;
    publisher_card: string;
    publisher_account: string;
    status: StatusEnum;
    register_date: string;
  };
}
export interface PublisherContractParamsSchema {
  publisherId: NumberIsomorphic;
}

export interface PublisherAddPromoParamsSchema {
  id: PublisherId;
}

export interface PublisherContractQuerySchema {
  collaboration_type?: NumberIsomorphic | CollaborationType;
  country?: NumberIsomorphic;
}
export type PublisherContractResponseSchema = PublisherContractFormSchema;
export type PostPublisherContractRequestSchema = Partial<PublisherContractSchema['results']>;
export type PublisherContractSendFileParamsSchema = PublisherContractParamsSchema;
export interface PublisherContractSendFileRequestSchema {
  contract: string;
}
export interface PublisherActsByContractIdParamsSchema {
  contractId: NumberIsomorphic;
}
export interface ActSchema {
  id: number;
  file: string;
  status: StatusEnum;
  create_date: string;
  accept_date: string;
}
export type PublisherActsByContractIdResponseSchema = V1Response<ActSchema[], never>;
export interface PublisherActsDownloadParamsSchema {
  contractId: NumberIsomorphic;
  actId: NumberIsomorphic;
}

export interface PublisherManualWithdrawRequestSchema {
  sum: string;
}
