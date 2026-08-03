import type { ComponentType, ReactNode } from 'react';
import Link from 'next/link';

import Admin from '@re/ui-kit/icons/admin';
import EditIcon from '@re/ui-kit/icons/edit';
import ExternalLink from '@re/ui-kit/icons/external-link';
import { PauseIcon } from '@re/ui-kit/icons/pause';
import { PlayIcon } from '@re/ui-kit/icons/play';
import Report from '@re/ui-kit/icons/report';
import { VolumeOffIcon } from '@re/ui-kit/icons/volume-off';
import { VolumeOnIcon } from '@re/ui-kit/icons/volume-on';
import { Button } from '@re/ui-kit/ui/button';
import { ReText, textVariants } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useContentType } from '~app/providers/site-config-provider';
import { useHeroCardControlsStore } from '~entities/inventory/model/stores';
import { CardShare } from '~entities/inventory/ui/hero-card-share';
import { ReportModalAsync } from '~entities/report/ui/report.async';
import type { HeroCardSchema } from '~shared/api/models/inventory';
import { Routing } from '~shared/config/routing';
import { StaffOnlyLink } from '~shared/lib/auth/staff-only-link';
import { useSession } from '~shared/lib/session/use-session';
import { Expandable } from '~shared/ui/expandable';
import { linkBaseVariants } from '~shared/ui/link-base';
import { publicEnv } from '~shared/utils/env';
import { UrlFormatter } from '~shared/utils/url-formatter';

import { HeroCard, HeroCardProps } from '../hero-card';

export type HeroCardPreviewProps<T extends ComponentType> = HeroCardProps<HeroCardSchema, T> & {
  card: HeroCardSchema;
  afterTitleSlot?: ReactNode;
  prevLineSlot?: ReactNode;
  afterLineSlot?: ReactNode;
  overrides?: {
    title?: ReactNode;
    fullContent?: ReactNode;
    cardBackground?: ReactNode;
    description?: ReactNode;
  };
};

export const PlayControlButton = () => {
  const { isAnimationEnabled, setIsAnimationEnabled } = useHeroCardControlsStore();

  return (
    <Button size="lg" circle variant="secondary" onClick={() => setIsAnimationEnabled((v) => !v)}>
      {isAnimationEnabled ? <PauseIcon className="size-5" /> : <PlayIcon className="size-5" />}
    </Button>
  );
};
export const SoundControlButton = () => {
  const { isSoundEnabled, setIsSoundEnabled } = useHeroCardControlsStore();

  return (
    <Button size="lg" circle variant="secondary" onClick={() => setIsSoundEnabled((v) => !v)}>
      {isSoundEnabled ? <VolumeOnIcon className="size-5" /> : <VolumeOffIcon className="size-5" />}
    </Button>
  );
};

export const HeroCardPreview = <T extends ComponentType>(props: HeroCardPreviewProps<T>) => {
  const {
    card,
    imgSize = 'high',
    overrides = {},
    afterTitleSlot,
    prevLineSlot,
    afterLineSlot,
  } = props;
  const contentType = useContentType();
  const user = useSession();

  const character = overrides.title || card.character?.name || 'Коллекционная карточка';
  const isAnimated = typeof card?.cover?.mid === 'string' && card.cover.mid.endsWith('.webm');

  const hasSound = card.has_audio;

  return (
    <div className="flex flex-col items-center gap-5 sm:mt-[50px]">
      <div className="relative">
        {overrides.cardBackground}
        <div className="animate-sway relative bottom-0 left-1/2 h-[375px] w-[250px] -translate-x-1/2 select-none perspective-[1000px] transform-3d sm:absolute">
          <HeroCard
            card={card}
            imgSize={imgSize}
            controlsOptions={{
              rewrites: { isSoundEnabled: null },
            }}
          />
        </div>
      </div>
      {overrides.fullContent || (
        <>
          <div className="flex flex-col items-center">
            {card.title ? (
              <Link
                shallow={false}
                prefetch={false}
                href={Routing.Title.detail({
                  params: {
                    content: contentType,
                    // @ts-ignore
                    dir: card.title.dir,
                    tab: 'main',
                  },
                })}
                target="_blank"
                className={cn(
                  linkBaseVariants({ variant: 'secondary' }),
                  textVariants({ weight: 'medium', align: 'center' }),
                  'mb-3 flex items-center gap-1'
                )}
              >
                {card.title.main_name} <ExternalLink />
              </Link>
            ) : null}
            {overrides.title || !card.character?.name ? (
              <ReText weight="semibold" size="lg">
                {character}
              </ReText>
            ) : (
              <Link
                //  @ts-ignore
                href={Routing.Character.main({ params: { id: card.character.id } })}
                className={cn(
                  linkBaseVariants({ variant: 'secondary' }),
                  'hover:text-foreground',
                  textVariants({
                    weight: 'semibold',
                    size: 'lg',
                  }),
                  'flex items-center gap-1'
                )}
              >
                {character} <ExternalLink />
              </Link>
            )}

            {!overrides?.description && card.description ? (
              <Expandable
                maxHeight={105}
                renderContent={(ref) => (
                  <ReText
                    ref={ref}
                    weight="medium"
                    dangerouslySetInnerHTML={{ __html: card.description || '' }}
                    color="muted-foreground"
                    className="mt-2 break-words"
                    align="center"
                  />
                )}
              />
            ) : (
              overrides?.description
            )}
          </div>
          {afterTitleSlot}
          <div className="flex flex-wrap items-center gap-3">
            {prevLineSlot}

            {isAnimated ? (
              <div className="flex items-center justify-center gap-2 rounded-md px-2">
                <PlayControlButton />
                {hasSound ? <SoundControlButton /> : null}
              </div>
            ) : null}
            <CardShare color="secondary" className="bg-secondary border-0" model={card} />
            {afterLineSlot}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {card.author ? (
              <Button color="secondary" asChild>
                <Link
                  shallow={false}
                  prefetch={false}
                  href={Routing.User.detail({
                    params: { id: card.author.id, tab: 'about' },
                  })}
                  target="_blank"
                >
                  Автор: {card.author.username}
                </Link>
              </Button>
            ) : null}
            <Button asChild color="secondary">
              <Link
                shallow={false}
                prefetch={false}
                href={Routing.Card.id({ params: { id: card.id } })}
                target="_blank"
              >
                Пользователи с этой картой
              </Link>
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-3 self-center">
            {user && (card.author?.id === user.id || user.is_staff) ? (
              <Button asChild circle color="secondary">
                <Link
                  shallow={false}
                  prefetch={false}
                  href={Routing.Card.edit({ params: { id: card?.id } })}
                  target="_blank"
                >
                  <EditIcon size={20} />
                </Link>
              </Button>
            ) : null}
            <ReportModalAsync type="card" target={card?.id}>
              <Button color="secondary" circle>
                <Report />
              </Button>
            </ReportModalAsync>
            <Button asChild color="secondary" circle>
              <StaffOnlyLink
                target="_blank"
                href={UrlFormatter.createUrl(
                  publicEnv('ADMIN_URL'),
                  `/inventory/carditem/${card.id}/change/`
                )}
              >
                <Admin />
              </StaffOnlyLink>
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
