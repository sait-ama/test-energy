import {
  MinigameLeaderboardListParamsSchema,
  MinigamesUserProgressParamsSchema,
} from '~shared/api/models/battlepass';
import { queryKit } from '~shared/api/react-query';

export namespace BattlepassQueryKeys {
  export const tasks = queryKit.createQueryKey<void, void>((variables) => [
    'battlepass-tasks',
    {
      ...variables,
      authDepend: true,
    },
  ]);

  export const current = queryKit.createQueryKey<void, void>((variables) => [
    'battlepass-current',
    {
      ...variables,
      authDepend: true,
    },
  ]);

  export const preview = queryKit.createQueryKey<void, void>((variables) => [
    'battlepass-preview',
    {
      ...variables,
      authDepend: true,
    },
  ]);

  export const gameLeaderboard = queryKit.createQueryKey<MinigameLeaderboardListParamsSchema, void>(
    (variables) => ['game-leaderboard', variables]
  );
  export const userProgress = queryKit.createQueryKey<MinigamesUserProgressParamsSchema, void>(
    (variables) => [
      'user-progress',
      {
        ...variables,
        authDepend: true,
      },
    ]
  );
}
