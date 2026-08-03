'use client';

import Link from 'next/link';

import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { useCurrentPageSuspenseTitleDetail } from '~pages/(title)/title-detail/model/queries';
import { UrlFormatter } from '~shared/utils/url-formatter';

export const TitleExternalAdaptation = () => {
  const { data } = useCurrentPageSuspenseTitleDetail();
  const { features } = useSiteConfig();

  if (!data?.adaptation) return null;
  if (!features.EXTERNAL_TITLE_ADAPTATION) return null;

  return (
    <div className="relative mt-6 flex h-50 items-center justify-between gap-4 px-6 md:px-10">
      <div
        className="absolute inset-0 z-0 z-[-1] overflow-hidden rounded-lg bg-cover bg-center bg-no-repeat opacity-10"
        style={{
          backgroundImage: `url(${UrlFormatter.media(data.adaptation.cover.mid)})`,
          backgroundPositionY: '25%',
        }}
      />
      <div className="mx-auto box-content flex h-fit min-w-50 flex-1 flex-col items-start">
        <ReText size="lg" weight="semibold">
          {data.adaptation.name}
        </ReText>
        {data.adaptation.description && (
          <ReText size="sm" lineClamp={3} color="muted-foreground">
            {data.adaptation.description}
          </ReText>
        )}
        <Button rel="noreferrer" asChild className="mt-4">
          <Link prefetch={false} target="_blank" href={data.adaptation.url}>
            Подробнее
          </Link>
        </Button>
      </div>
      <div className="hidden justify-center md:flex">
        <img
          alt={data.adaptation.name}
          className="shadow-elevation -mt-4 mb-4 max-w-full min-w-40 rounded-md"
          src={UrlFormatter.media(data.adaptation.cover.mid)}
        />
      </div>
    </div>
  );
};
