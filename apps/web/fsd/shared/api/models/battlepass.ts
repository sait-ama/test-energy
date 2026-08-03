import type { TitleSchema } from '~shared/api/models/title';

export interface BattlePassListTasksListResponseSchema
  extends V1Response<Record<string, BattlePassTask[]>> {}

export interface BattlePassCurrentResponseSchema
  extends V1Response<{
    battlepass: BattlePassInfo;
    levels: BattlePassLevels[];
  }> {}

export interface BattlePassPreviewResponseSchema
  extends V1Response<{
    date_end: string;
    date_start: string;
    exp_per_level: number;
    is_active: boolean;
    name: string;
    user_has_bp: boolean;
  }> {}

export interface BattlePassTask {
  claimed: boolean;
  description: string;
  goal: number;
  id: number;
  name: string;
  progress: number;
  reward: number;
  image: string;
  event: number;
  refresh: 'daily' | 'weekly' | 'monthly' | 'special' | 'global';
}

export interface BattlePassCompleteTaskRequestSchema {
  task: number;
}

export interface BattlePassReplaceTaskRequestSchema {
  task: number;
}

// prev

interface BattlePassVersionName {
  name: string;
  versionKey: string;
}

interface BattlePassVersionOwning {
  isOwned: boolean;
  version: string;
}

export interface BattlePassUserLevel {
  level: number;
  version: string;
}

export interface BatttlePassClaimRewardRequestSchema {
  // version: string;
}

export interface BattlePassCheckAccessRequestSchema {
  version: string;
}

interface BattlePassInfo {
  battlepass: {
    date_end: string;
    date_start: string;
    exp_per_level: number;
    is_active: boolean;
    name: string;
    user_has_bp: boolean;
    versions: BattlePassVersionName[];
  };
  exp: number;
  levels: BattlePassUserLevel[];
  versions: BattlePassVersionOwning[];
  max_swaps_count?: number;
  swaps_count?: number;
}

export interface RewardBadge {
  name: string;
}

export interface RewardTicket {
  count: number;
}

export interface ReadingFreeTitle
  extends Pick<TitleSchema, 'dir' | 'type' | 'cover' | 'id' | 'main_name' | 'secondary_name'> {
  read_daily: number;
}

export interface RewardFreeReadingTitle {
  title_choice: ReadingFreeTitle[];
}

export interface BattlePassReward {
  id: number;
  level: number;
  reward_name: string;
  reward_settings: RewardBadge | RewardTicket | RewardFreeReadingTitle;
  reward_description: string;
  reward_image: string;
  reward_type: number | undefined;
  version: string;
}

export interface BattlePassLevels {
  level: number;
  rewards: Record<'level', BattlePassReward[]>;
}

export interface BattlePass {
  battlepass: BattlePassInfo;
  levels: BattlePassLevels[];
}

export interface BattlePassManageMinigamesRequestSchema {
  game_id: number;
}
