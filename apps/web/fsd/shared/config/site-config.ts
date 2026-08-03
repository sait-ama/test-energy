import { cache } from 'react';

import { demoRemangaConfig } from '~shared/config/_configs/demo-remanga-org';
import { mirrorConfig } from '~shared/config/_configs/mirror-org';
import { reanimeConfig } from '~shared/config/_configs/reanime-org';
import { reaperMangaOrgConfig } from '~shared/config/_configs/reapermanga-org';
import { rehentaiConfig } from '~shared/config/_configs/rehentai-org';
import { remangaGeConfig } from '~shared/config/_configs/remanga-ge';
import { remangaKzConfig } from '~shared/config/_configs/remanga-kz';
import { remangaMeConfig } from '~shared/config/_configs/remanga-me';
import { remangaConfig } from '~shared/config/_configs/remanga-org';
import { renovelsConfig } from '~shared/config/_configs/renovels-org';
import type { SiteConfig } from '~shared/config/constants';
import { ContentTypes, SiteUrls } from '~shared/config/constants';
import { publicEnv } from '~shared/utils/env';

import { recomicsConfig } from './_configs/recomics-org';
import { stageRemangaConfig } from './_configs/stage-remanga-org';

const createConfig = () => {
  const siteConfig = new Map<SiteUrls, SiteConfig>();

  // REMANGA
  siteConfig.set(SiteUrls.ReMangaOrg, remangaConfig);
  siteConfig.set(SiteUrls.ReMangaMe, remangaMeConfig);
  // siteConfig.set(SITE_URL.ReComicsOrg, recomicsConfig);
  siteConfig.set(SiteUrls.ReMangaOrgMirror, mirrorConfig);
  siteConfig.set(SiteUrls.ReComicsOrg, recomicsConfig);
  // siteConfig.set(SITE_URL.ReMangaGe, remangaGeConfig);

  // ALTS
  siteConfig.set(SiteUrls.ReaperMangaOrg, reaperMangaOrgConfig);
  siteConfig.set(SiteUrls.ReMangaGe, remangaGeConfig);
  // siteConfig.set(SITE_URL.NeMangaOrg, nemangaConfig);
  // siteConfig.set(SITE_URL.NeMangaIo, nemangaIoConfig);
  siteConfig.set(SiteUrls.ReMangaKz, remangaKzConfig);
  siteConfig.set(SiteUrls.ReHentai, rehentaiConfig);

  // siteConfig.set(SITE_URL.TestReMangaOrg, testConfig);
  // siteConfig.set(SITE_URL.ReaderReMangaOrg, testConfig);

  // RENOVELS
  siteConfig.set(SiteUrls.ReNovelsOrg, renovelsConfig);
  // siteConfig.set(SITE_URL.TestReNovelsOrg, renovelsTestConfig);

  // ANIME
  siteConfig.set(SiteUrls.ReAnimeOrg, reanimeConfig);

  // DEV
  siteConfig.set(SiteUrls.Localhost, remangaConfig);
  siteConfig.set(SiteUrls.StageReMangaOrg, stageRemangaConfig);
  siteConfig.set(SiteUrls.DemoRemangaOrg, demoRemangaConfig);

  return siteConfig;
};

const siteConfig = createConfig();

export const getSiteConfig = (name?: SiteUrls): SiteConfig | null =>
  siteConfig.get(name || (publicEnv('DOMAIN') as SiteUrls))!;

export const getCurrentSiteConfig = cache(() => getSiteConfig(publicEnv('DOMAIN') as SiteUrls));

export const getContentType = cache((): ContentTypes => getCurrentSiteConfig()!.contentType);
