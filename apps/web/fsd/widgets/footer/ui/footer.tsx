'use server';
import React, { Suspense } from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import DiscordIcon from '@re/ui-kit/icons/discord';
import TelegramIcon from '@re/ui-kit/icons/telegram';
import TiktokIcon from '@re/ui-kit/icons/tik-tok';
import VkIcon from '@re/ui-kit/icons/vk';
import YouTubeIcon from '@re/ui-kit/icons/youtube';
import { Button } from '@re/ui-kit/ui/button';
import { Separator } from '@re/ui-kit/ui/separator';
import { ReText } from '@re/ui-kit/ui/text';
import dayjs from 'dayjs';

import { SiteNames } from '~shared/config/constants';
import { getSiteConfig } from '~shared/config/site-config';
import { DomainExclusive } from '~shared/lib/domain/domain-exclusive';
import { fallbackEmpty as _ } from '~shared/seo/fallback-empty';
import { LinkBase } from '~shared/ui/link-base';
import {
  AppPromo,
  FooterContainer,
  FooterList,
  FooterRoot,
  FooterTitle,
} from '~widgets/footer/ui/components';

const icons = {
  tiktok: <TiktokIcon />,
  telegram: <TelegramIcon />,
  discord: <DiscordIcon />,
  vk: <VkIcon />,
  youtube: <YouTubeIcon />,
};

export interface FooterFeatures {
  appPromo?: boolean;
}

export interface FooterProps {
  features?: FooterFeatures;
}

// export const FooterNoop = () => null;

export const DefaultFooter = async (props: FooterProps) => {
  const { features } = props;
  const { entries, site } = getSiteConfig()!;

  const t = await getTranslations('navigation.footer');

  return (
    <FooterRoot>
      {features?.appPromo ? <AppPromo /> : null}
      <div className="flex flex-col gap-8 md:flex-row md:justify-between">
        <FooterContainer className="gap-2">
          <ReText size="lg" weight="semibold">
            {site.name}
          </ReText>
          <ReText size="xs" color="muted-foreground" className="max-w-80">
            {t.rich('have-questions', {
              supportUrl: _(site.contacts?.supportUrl),
              email: _(site.contacts?.email),
              hasBoth: String(site.contacts?.supportUrl && site.contacts.email),
              emailLink: (children) => (
                <LinkBase>
                  <a href={`mailto:${site.contacts?.email}`} rel="noreferrer">
                    {children}
                  </a>
                </LinkBase>
              ),
              supportLink: (children) => (
                <LinkBase>
                  <a href={site.contacts?.supportUrl} target="_blank" rel="noreferrer">
                    {children}
                  </a>
                </LinkBase>
              ),
            })}
          </ReText>

          {site.contacts?.legalCredentials ? (
            <ReText size="xs" color="muted-foreground" className="max-w-80">
              {site.contacts?.legalCredentials}
            </ReText>
          ) : null}

          <DomainExclusive
            exclude={[SiteNames.ReComics, SiteNames.NeManga, SiteNames.ReMangaGeorgia]}
          >
            <div className="flex flex-col gap-6">
              {site.contacts?.social ? (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(site.contacts.social).map(([key, value]) => (
                    <Link shallow={false} prefetch={false} key={value} href={value} target="_blank">
                      <Button className="size-4xl" color="secondary" circle>
                        {icons[key as keyof typeof icons]}
                        <span className="sr-only">{key}</span>
                      </Button>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </DomainExclusive>
        </FooterContainer>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {Object.keys(entries).map((key) => (
            <FooterContainer key={key}>
              {/*// @ts-ignore*/}
              <FooterTitle>{t(`${key}.heading`)}</FooterTitle>
              {/*// @ts-ignore*/}
              <FooterList section={key} />
            </FooterContainer>
          ))}
        </div>
      </div>

      <Separator className="my-4" />
      <div className="flex justify-between">
        <Suspense fallback={null}>
          <ReText color="muted-foreground" size="xs">
            &copy; {site.name}&nbsp;
            {dayjs(new Date()).year()}.
          </ReText>
        </Suspense>

        <ReText color="muted-foreground" size="xs">
          {t('all-rights-reserved')}
        </ReText>
      </div>
    </FooterRoot>
  );
};
