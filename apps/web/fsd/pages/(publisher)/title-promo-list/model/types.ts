export interface TitlePromoPageParams {
  dir: string;
}

export interface TitlePromoPageSearchParams {
  promo?: string;
}

export interface TitlePromoListTableItemSchema {
  id: number;
  name: string;
  href?: string | null;
  dateStart: string;
  dateEnd: string;
  daysSpent: number;
  daysLeft: number;
  totalDays: number;
  isActive: boolean;
  // viewsToday: number;
  // clicksToday: number;
  // ctrToday: number;
  viewsOverall: number;
  clicksOverall: number;
  ctrOverall: number;
  children?: TitlePromoListTableItemSchema[] | null;
  childrenCount?: number;
  $$hasChildren: boolean;
}

export interface TitlePromoBillingTableItemSchema {
  name?: string | null;
  id: number;
  sum: number;
  action_type: string;
  created_at: string;
}
