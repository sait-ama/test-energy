import type { ComponentProps } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import AppStore from '@re/ui-kit/icons/app-store';
import GooglePlayIcon from '@re/ui-kit/icons/google-play';
import Rustore from '@re/ui-kit/icons/rustore';
import { Badge } from '@re/ui-kit/ui/badge';
import { ReText, TextProps, textVariants } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { ContentTypes, SiteConfig } from '~shared/config/constants';
import { getSiteConfig } from '~shared/config/site-config';
import { Container as RootContainer } from '~shared/ui/container';
import { LinkBase } from '~shared/ui/link-base';
import { UrlFormatter } from '~shared/utils/url-formatter';
import { AppButton } from '~widgets/footer/ui/app-button';

export const FooterRoot = (props: ComponentProps<'footer'>) => {
  const { children, className, ...rest } = props;

  return (
    <RootContainer slim asChild>
      <footer className={cn('mt-16 mb-20 flex flex-col gap-4 px-4', className)} {...rest}>
        {children}
      </footer>
    </RootContainer>
  );
};

export const FooterTitle = (props: TextProps) => {
  const { className, children, ...rest } = props;

  return (
    <ReText size="md" className={cn('uppercase', className)} weight="bold" {...rest}>
      {children}
    </ReText>
  );
};

interface ListProps extends Omit<ComponentProps<'div'>, 'children'> {
  section: keyof SiteConfig['entries'];
}

export const FooterList = async (props: ListProps) => {
  const { className, section, ...rest } = props;

  const config = getSiteConfig()!;
  const t = await getTranslations('navigation.footer');
  const values = Object.entries(config.entries[section]).filter(([_, it]) => !it.invisible);

  if (!values.length) return null;

  return (
    <div className={cn('flex flex-col gap-2', className)} {...rest}>
      {values.map(([key, entry]) => (
        <LinkBase key={entry.route} variant="secondary">
          <a href={entry.route} title={key} className={textVariants({ size: 'xs' })}>
            {/*@ts-ignore*/}
            {t(`${section}.${key}`)}
            {entry.new ? <Badge color="secondary">new</Badge> : null}
          </a>
        </LinkBase>
      ))}
    </div>
  );
};

export const FooterContainer = (props: ComponentProps<'div'>) => {
  const { className, children, ...rest } = props;

  return (
    <div className={cn('flex flex-col gap-3', className)} {...rest}>
      {children}
    </div>
  );
};

export const AppPromo = async () => {
  const config = getSiteConfig()!;
  const t = await getTranslations('navigation.footer');
  const app = config.site.app;

  if (config.contentType !== ContentTypes.MANGA) return null;

  return (
    <div className="bg-card relative mb-8 flex h-[146px] w-full flex-col items-center justify-center overflow-hidden rounded-md">
      <div className="relative flex h-full min-w-[1200px] justify-center">
        <Image
          width="276"
          height="276"
          src={UrlFormatter.media('public/app/remanga.webp')}
          alt={config.site.name}
          className={cn(
            'pointer-events-none absolute top-0 left-0 h-[276px] w-[276px] overflow-hidden opacity-[0.02] select-none'
          )}
        />
        <Image
          width="276"
          height="276"
          src={UrlFormatter.media('public/app/remanga.webp')}
          alt={config.site.name}
          className={cn(
            'pointer-events-none absolute top-0 right-0 h-[276px] w-[276px] overflow-hidden opacity-[0.02] select-none'
          )}
        />
        <Image
          width="276"
          height="276"
          src={UrlFormatter.media('public/app/remanga.webp')}
          alt={config.site.name}
          className={cn(
            'pointer-events-none absolute bottom-0 left-1/2 h-[276px] w-[276px] -translate-x-1/2 overflow-hidden opacity-[0.02] select-none'
          )}
        />
        <Image
          width="966"
          height="146"
          src={UrlFormatter.media('public/app/cats.png')}
          alt={config.site.name}
          className={cn(
            'pointer-events-none absolute hidden h-[146px] min-w-[966px] overflow-hidden select-none md:flex'
          )}
        />
      </div>
      <div className="absolute flex flex-col gap-4">
        <ReText size="md" weight="semibold" className="uppercase" align="center">
          {t('app-banner.heading')}
        </ReText>

        <div className="align-center flex flex-wrap justify-center gap-2">
          {app?.android ? (
            <Link shallow={false} prefetch={false} href={app?.android ?? ''} target="_blank">
              <AppButton>
                <GooglePlayIcon />
                {t('app.google-play')}
              </AppButton>
            </Link>
          ) : null}

          {app?.ios ? (
            <Link shallow={false} prefetch={false} href={app?.ios ?? ''} target="_blank">
              <AppButton>
                <AppStore />
                {t('app.app-store')}
              </AppButton>
            </Link>
          ) : null}

          {app?.rustore ? (
            <Link shallow={false} prefetch={false} href={app?.rustore ?? ''} target="_blank">
              <AppButton>
                <Rustore />
                {t('app.rustore')}
              </AppButton>
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
};
