import type { CreatorType } from '~shared/api/models/creator';
import type { TitleSchema } from '~shared/api/models/title';
import type { UserSchemaFragment } from '~shared/api/models/user';
import type {
  LogicalBinaryTypeIsomorphic,
  ResponseResults,
  ResponseResultsV2,
} from '~shared/types/buisines';

export enum ContractAgreementStage {
  CANCELED,
  CONTRACT_SENDED,
  CONTRACT_ACCEPTED,
  SCAN_SENDED,
  SCAN_ACCEPTED,
}

export enum Monetization {
  DECLINED = -1,
  NOT_CHECKED,
  HAS_ABILITY,
  ENABLED,
}

export type PublisherId = NumberIsomorphic;

export type PublisherLinkType = 'vk' | 'fb' | 'youtube' | 'insta' | 'discord' | 'twitter';

export interface PublisherSchema {
  id: number;
  name: string;
  is_small?: boolean;
  promo_days_balance: number;
  dir: PublisherDir;
  cover: Record<'high' | 'mid' | 'low', string | null>;
  wallpaper: Record<'high' | 'mid' | 'low', string | null>;
  withdraw_total_sum: string;
  tagline: string;
  description: string;
  type: { id: CreatorType; name: string };
  balance: string;
  monetization: Monetization;
  links: Record<PublisherLinkType, string>;
  show_donate: boolean;
  is_subscribed_posts: boolean;
  count_titles: number;
  is_subscribed_titles: boolean;
  count_period_chapters: number;
  count_votes: number;
  contract_agreement_stage: ContractAgreementStage;
  contract_id: number;
  donate_page_text: string;
}

export type PublisherSchemaFragment = Pick<
  PublisherSchema,
  'id' | 'name' | 'tagline' | 'cover' | 'dir'
>;

type PublisherDir = string;

export interface Branch {
  id: number;
  count_chapters?: number;
  total_votes?: number;
}

export interface PromoDay {
  date: string;
  daily_views: number;
  daily_clicks: number;
}

export type PromoHistory = Record<string, PromoDay[]>;

export interface AdTitleSchema {
  title: Pick<TitleSchema, 'main_name' | 'id' | 'secondary_name' | 'dir' | 'cover'>;
  publisher: Pick<PublisherSchema, 'id' | 'name' | 'cover'>;
  branch: Pick<Branch, 'id' | 'count_chapters' | 'total_votes'>;
  is_active: boolean;
  date_start: string | null;
  date_end: string | null;
  days_left: number;
  days_this_promo: number;
  promo_history: PromoHistory;
  render_count: number;
  render_count_day: number;
  render_count_this: number;
  click_count: number;
  click_count_this: number;
  click_count_day: number;
}

export interface TransformedDataTable {
  mainName: string;
  titleDir: string;
  status: boolean;
  dates: DataTableDates;
  clicks: DataTableClicks;
  views: DataTableViews;
  ctr: DataTableCtr;
}

export interface PublisherStrikeTable {
  date: string;
  date_end: string | null;
  is_active: boolean;
  reason: string | null;
  restrictions: Restrictions[];
}

export interface PublisherMembersTable {
  user: PublisherMemberSchema['user'];
  role: PublisherMemberSchema['role'];
  privileges_change_immutable: boolean;
  privileges: PublisherMemberSchema['privileges'];
  rights: PublisherMemberSchema['rights'];
}

export enum Restrictions {
  disable_edit_title = 'disable_edit_title',
  disable_monetization = 'disable_monetization',
  disable_add_title = 'disable_add_title',
  disable_edit_publisher = 'disable_edit_publisher',
}

export interface Strike {
  date: string;
  date_end: string | null;
  is_active: boolean;
  reason: string | null;
  restrictions: Restrictions[];
}

interface DataTableDates {
  dateStart: string | null;
  dateEnd: string | null;
}

interface DataTableClicks {
  clicksDay: number;
  clicksThis: number;
  clicksTotal: number;
}

interface DataTableViews {
  viewsDay: number;
  viewsThis: number;
  viewsTotal: number;
}

interface DataTableCtr {
  ctrToday: number;
  ctrTotal: number;
}

interface AdTitleSelectTitles {
  operation: 'titles';
  publisher_id: NumberIsomorphic;
}

interface AdTitleSelectBranches {
  operation: 'branches';
  publisher_id: NumberIsomorphic;
  title_dir: string;
}

interface AdTitleSelectPublishers {
  operation: 'publishers';
}

//params Schemas//////////////////////////
export interface PublisherDirParamsSchema {
  dir: PublisherDir;
}

export interface PublisherIdParamsSchema {
  id: NumberIsomorphic;
}

export interface PublisherWithDrawByIdParamsSchema {
  id: NumberIsomorphic;
}

export interface PublisherWithDrawSchema {
  id: number;
  user: UserSchemaFragment;
  sum: string;
  purse: string;
  //todo
  status: string | 'В очереди';
  message: string;
  create_date: string;
  complete_date: string;
}

export interface PublisherWithDrawProps {
  total_items: number;
  total_pages: number;
  page: number;
}

export type PublisherWithDrawListResponseSchema = V1Response<
  PublisherWithDrawSchema[],
  PublisherWithDrawProps
>;

export interface PublisherMemberDetailParamsSchema extends PublisherIdParamsSchema {
  memberId: NumberIsomorphic;
}

export interface UpdatePublisherMemberParamsSchema {
  publisher_id: NumberIsomorphic;
  user_id: NumberIsomorphic;
}

export interface UpdatePublisherMemberRequestSchema {
  role: RoleMembers;
  rights: (PublisherRights & string)[];
  status: LogicalBinaryTypeIsomorphic;
}

export interface RightSchema {
  name: PublisherRights & string;
  label: string;
}

export interface AllRightsResponseSchema {
  results: RightSchema[];
}

export interface PublisherAdTitlesDetailsParamsSchema {
  dir: PublisherDir;
  id: PublisherId;
}

export interface PublisherAdTitlesListParamsSchema {
  id: PublisherId;
}

export interface PublisherActivateAdParamsSchema {
  publisherId: PublisherId;
  dir: string;
}

export interface PublisherDeactivateAdParamsSchema {
  publisherId: PublisherId;
  dir: string;
}

export interface PublisherBuyAdDaysParamsSchema {
  publisherId: PublisherId;
}

export interface PublisherBuyAdDaysResponseSchema {
  content: string;
}

export interface PublisherBuyAdDaysRequestSchema {
  days: string;
}

export interface PublisherAddAdTitleParamsSchema {
  publisherId: PublisherId;
  dir: string;
}

export interface PublisherTitleSelectOptionsParamsSchema {
  publisherId: PublisherId;
  dir: string;
}

export interface PublisherGetStrikesParamsSchema {
  publisherId: PublisherId;
}

//query Schemas//////////////////////////////////
export interface PublisherAdTitlesDetailsQuerySchema extends V1Response<AdTitleSchema> {}

export interface PublisherQuerySchema extends V1Response<PublisherSchema> {}

export interface PublisherAdTitlesListQuerySchema {}

export interface PublisherAddAdTitleCallQuerySchema {}

export interface PublisherTitleSelectOptionsQuerySchema {}

export interface PublisherGetStrikesQuerySchema {}

//requests schemas//////////////////////////

export interface PublisherAdTitlesDetailsRequestSchema {}

export interface PublisherRequestSchema {}

export interface PublisherAdTitlesListRequestSchema {}

export interface PublisherActivateAdRequestSchema {
  date_start: string | null;
  date_end: string | null;
}

export type PublisherDeactivateAdRequestSchema =
  | AdTitleSelectBranches
  | AdTitleSelectPublishers
  | AdTitleSelectTitles;

export interface PublisherAddAdTitleRequestSchema {
  publisher_id: string;
  branch_id: string;
  title_dir: string;
}

export interface PublisherTitleSelectOptionsRequestSchema {}

export interface PublisherTitleSelectOptionsResponseSchema {
  content: Array<{ main_name: string; dir: string; id: number }>;
  //   todo what's a fucking unknown type
}

export interface PublisherGetStrikesRequestSchema {
  count: number;
  next: string;
  previous: string;
  results: Strike[];
}

// export type getPublisherByDirRequest = PublisherDir;

//responseSchemas//////////////////////////
export interface PublisherAdTitlesDetailsResponseSchema extends V1Response<AdTitleSchema> {}

export interface PublisherPropsSchema {
  referral: string | null;
  referral_count: number;
  is_member: boolean;
  can_update: boolean;
  can_watch_statistic: boolean;
  can_withdraw_money: boolean;
  can_manage_members: boolean;
  admin_link: string | null;
  can_sign_contract: boolean;
  MIN_WITHDRAW_SUM: number;
  MAX_WITHDRAW_SUM: number;
}

export interface PublisherResponseSchema
  extends V1Response<PublisherSchema, PublisherPropsSchema> {}

export interface PublisherAdTitlesListResponseSchema extends V1Response<AdTitleSchema[]> {}

export interface PublisherQueryResponseSchema extends PublisherSchema {}

export enum PublisherRights {
  CAN_ADD_PROMOTION = 'can_add_promotion',
  CAN_SIGN_CONTRACT = 'can_sign_contract',
  CAN_CREATE_CHAPTERS = 'can_create_chapters',
  CAN_CREATE_TITLES = 'can_create_titles',
  CAN_CREATE_TOME = 'can_create_tome',
  CAN_DELETE_CHAPTERS = 'can_delete_chapters',
  CAN_EDIT_CHAPTERS = 'can_edit_chapters',
  CAN_EDIT_TITLES = 'can_edit_titles',
  CAN_EDIT_TITLES_WITHOUT_MODER = 'can_edit_titles_without_moder',
  CAN_EDIT_TOME = 'can_edit_tome',
  CAN_INVITE_MEMBERS = 'can_invite_members',
  CAN_MAKE_CHAPTERS_FREE = 'can_make_chapters_free',
  CAN_PIN_COMMENTS = 'can_pin_comments',
  CAN_PUBLISH_CHAPTERS = 'can_publish_chapters',
  CAN_READ_CHAPTERS = 'can_read_chapters',
  CAN_UPDATE_DETAILS = 'can_update_details',
  CAN_UPDATE_MEMBERS = 'can_update_members',
  CAN_VIEW_ANNOUNCEMENT = 'can_view_announcement',
  CAN_VIEW_DONATES = 'can_view_donates',
  CAN_VIEW_PROMOTIONS = 'can_view_promotions',
  CAN_VIEW_STATISTICS = 'can_view_statistics',
  CAN_VIEW_STRIKES = 'can_view_strikes',
  CAN_CHANGE_INFO = 'can_change_info',
}

interface PublisherRight {
  name: string;
  label: PublisherRights;
}

export interface PublisherRightsListResponseSchema extends V1Response<PublisherRight[]> {}

export enum RoleMembers {
  CREATOR = 1,
  MODERATOR,
  MEMBER,
}

export interface PublisherMemberSchema {
  id: number;
  user: UserSchemaFragment;
  role: RoleMembers;
  privileges: number;
  rights: (PublisherRights & string)[];
  privileges_change_immutable: boolean;
}

export interface PublisherMemberDetailSchema {
  id: number;
  role: RoleMembers;
  status: boolean;
  rights: (PublisherRights & string)[];
}

export interface Privilege {
  id: number;
  name: string;
}

export interface PublisherMembersListResponseSchema
  extends ResponseResults<PublisherMemberSchema[]> {}

export interface PublisherMembersListParamsSchema {
  publisherId: NumberIsomorphic;
}

export interface PublisherContractorParamsSchema {
  publisherId: NumberIsomorphic;
}

export type PublisherUpdateResponseSchema = V1Response<
  {},
  Omit<PublisherSchema, 'withdraw_total_sum'>
>;
export type PublisherUpdateRequestSchema = Partial<{
  name: string;
  tagline: string;
  description: string;
  show_donate: true;
  donate_page_text: string;
  vk: string;
  fb: string;
  youtube: string;
  twitter: string;
  insta: string;
  discord: string;
  type: CreatorType;
  cover: string | null;
  wallpaper: string | null;
}>;

export interface PublisherContractorRequestSchema {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  middle_name: string;
}

export interface CardSchema {
  id: number;
  card: string;
}

export type CardListResponseSchema = V1Response<CardSchema[], never>;

export interface CardRequestSchema {
  card_id: number;
}

export interface PublisherStaticPropsSchema {
  titles: { id: number; name: string }[];
  date_start: string;
  date_end: string;
}

export type Field = 'views' | 'payments' | 'bookmarks';

interface StatSchemaViews {
  views_total: number;
  votes_total: number;
}

interface StatSchemaPayments {
  payments_total: number;
  donates_total: number;
  referral_total: number;
  total: number;
}

interface StatSchemaBookmarks {
  t: number;
}

export type StatSchema<TField extends Field | string = string> = {} & (TField extends 'views'
  ? StatSchemaViews
  : TField extends 'payments'
    ? StatSchemaPayments
    : TField extends 'bookmarks'
      ? StatSchemaBookmarks
      : Partial<StatSchemaViews | StatSchemaPayments>) & {
    date: string;
    total: number;
  };

export interface PublisherStatisticQuerySchema {
  add: 'titles';
  fields: Field;
  date_end: string; //dd.mm.yyyy
  date_start: string; //dd.mm.yyyy
  titles?: string[]; // 1,2,3,4,5
  name?: string;
}

export type PublisherStatisticContentSchema<T extends Field | string = string> = Record<
  T,
  StatSchema<Field>[]
>;

export interface PublisherStatisticParamsSchema {
  publisherDir: string;
}

export type PublisherStatisticResponseSchema<T extends Field | string = string> = V1Response<
  PublisherStatisticContentSchema<T>,
  PublisherStaticPropsSchema
>;
export type PublisherStatisticResponseSchemaSerialized<T extends Field | string = string> =
  ResponseResultsV2<PublisherStatisticContentSchema<T>, PublisherStaticPropsSchema>;

export interface PublisherAddDaysRequestSchema {
  days: string;
  publisher_id: number;
}
