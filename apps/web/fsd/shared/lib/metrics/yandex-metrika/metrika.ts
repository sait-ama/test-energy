import { publicEnv } from '~shared/utils/env';

type ReachGoalParams =
  | {
      index: string;
      itemId: string;
    }
  | {
      itemId: string;
    }
  | { tab: string; itemId: string }
  | { bookmark: string }
  | { amount: string }
  | { dir: string };

interface MetrikaOptions {
  enabled: boolean;
}

class YandexMetrika {
  private readonly enabled: boolean;

  constructor(options: MetrikaOptions) {
    this.enabled = options.enabled;
  }

  getAppId = () => {
    return parseInt(publicEnv('METRIKA_APP_ID') || '', 10);
  };

  reachGoal = (goal: string, params?: ReachGoalParams) => {
    if (!this.enabled) return;
    const appId = this.getAppId();

    if (!appId) return;
    // @ts-ignore
    ym(appId, 'reachGoal', goal, params);
  };

  setView = (url: string) => {
    if (!this.enabled) return;
    const appId = this.getAppId();

    if (!appId) return;
    // @ts-ignore
    ym(this.getAppId(), 'hit', url);
  };
}

export const yaMetrika = new YandexMetrika({
  enabled: process.env.NODE_ENV === 'production',
});
