'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useInfiniteQuery, useSuspenseQuery } from '@tanstack/react-query';

import { getV2NextPageParam } from '@re/api/exports-core';
import {
  inventoryCharacterCardsRetrieveInfiniteOptions,
  v2TitlesCharactersRetrieveOptions,
} from '@re/api/generated/@tanstack/react-query.gen';
import Admin from '@re/ui-kit/icons/admin';
import Panel from '@re/ui-kit/icons/panel';
import Settings from '@re/ui-kit/icons/settings';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import { CharacterImage } from '~entities/character/ui/character-image';
import { HeroCard } from '~entities/inventory/ui/hero-card';
import { HorizontalTitleCard } from '~entities/title/ui/horizontal-title-card';
import { client } from '~shared/api/client';
import { Routing } from '~shared/config/routing';
import { AuthorizedLink } from '~shared/lib/auth/authorized-link';
import { StaffOnlyLink } from '~shared/lib/auth/staff-only-link';
import { useHeroCardModal } from '~shared/lib/card/use-card-modal';
import { sanitizeSync } from '~shared/lib/sanitize/sanitize-sync';
import {
  EntityLayoutActions,
  EntityLayoutAvatarContainer,
  EntityLayoutContent,
  EntityLayoutHeader,
  EntityLayoutHeadingContainer,
  EntityLayoutRoot,
  EntityLayoutSubtitle,
  EntityLayoutTitle,
  EntityLayoutTitleContainer,
} from '~shared/ui/entity-layout';
import type { FlatListType } from '~shared/ui/flat-list-v2';
import { FlatList as _FlatList } from '~shared/ui/flat-list-v2';
import { Section, SectionContent, SectionTitle } from '~shared/ui/section';
import { SpoiledText } from '~shared/ui/spoiled-text';
import { publicEnv } from '~shared/utils/env';
import { UrlFormatter } from '~shared/utils/url-formatter';

interface CharacterStatProps {
  label: string;
  value: string | number;
}

const CharacterStat = ({ label, value }: CharacterStatProps) => (
  <div className="flex w-full items-center gap-2">
    <ReText size="sm" weight="medium">
      {label}:
    </ReText>
    <ReText size="sm" color="muted-foreground">
      {value}
    </ReText>
  </div>
);

export const CharacterPage = () => {
  const params = useParams<{ id: string }>();
  const { data } = useSuspenseQuery({
    ...v2TitlesCharactersRetrieveOptions({ path: { id: Number(params.id) }, client }),
    select: (v) => ({ ...v, description: sanitizeSync(v.description!) }),
  });
  const {
    data: { pages: cardsPages = [] } = {},
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    ...inventoryCharacterCardsRetrieveInfiniteOptions({
      client,
      path: { character_id: Number(params.id) },
      query: { count: 20, page: 1 },
    }),
    getNextPageParam: getV2NextPageParam,
    initialPageParam: 1,
  });
  const { setCard } = useHeroCardModal();
  const cards = cardsPages.flatMap((it) => it.results);
  const t = useTranslations();
  const charT = useTranslations('character.character_details');
  const tForm = useTranslations('character.form.labels');
  const tEmpty = useTranslations('reusable.empty_states');
  const tSections = useTranslations('character.sections');

  const FlatList: FlatListType<typeof cards> = _FlatList;

  return (
    <EntityLayoutRoot>
      <EntityLayoutHeader>
        <EntityLayoutAvatarContainer>
          {({ size }) => (
            <>
              <CharacterImage
                imgSrc={data?.cover.high}
                alt={data?.name ?? t('character.form.image.alt')}
                size={size}
              />
            </>
          )}
        </EntityLayoutAvatarContainer>
        <EntityLayoutHeadingContainer>
          <EntityLayoutTitleContainer>
            <div className="space-y-2">
              <EntityLayoutTitle>{data?.name}</EntityLayoutTitle>
              {data?.alt_name ? <EntityLayoutSubtitle>{data.alt_name}</EntityLayoutSubtitle> : null}
            </div>
            <EntityLayoutActions>
              <Button asChild color="secondary" circle size="sm">
                <StaffOnlyLink
                  target="_blank"
                  href={UrlFormatter.createUrl(
                    publicEnv('PANEL_URL'),
                    `/characters/${params.id}/show`
                  )}
                >
                  <Panel />
                </StaffOnlyLink>
              </Button>
              <Button asChild color="secondary" circle size="sm">
                <StaffOnlyLink
                  target="_blank"
                  href={UrlFormatter.createUrl(
                    publicEnv('ADMIN_URL'),
                    `titles/titlecharacter/${params.id}/change/`
                  )}
                >
                  <Admin />
                </StaffOnlyLink>
              </Button>
              <Button asChild color="secondary" circle size="sm">
                <AuthorizedLink href={Routing.Character.edit({ params: { id: data?.id } })}>
                  <Settings />
                </AuthorizedLink>
              </Button>
            </EntityLayoutActions>
          </EntityLayoutTitleContainer>
        </EntityLayoutHeadingContainer>
      </EntityLayoutHeader>

      <EntityLayoutContent slim className="flex flex-col gap-4">
        <Section>
          <SectionTitle>{tForm('description')}</SectionTitle>
          <SectionContent>
            <SpoiledText>{data!.description || ''}</SpoiledText>
          </SectionContent>
        </Section>
        <Section>
          <SectionTitle>{tForm('details')}</SectionTitle>
          <SectionContent>
            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
              <CharacterStat
                label={tForm('power')}
                value={data?.details?.power ?? charT('unknown')}
              />
              <CharacterStat label={tForm('sex')} value={data?.details?.sex ?? charT('unknown')} />
              <CharacterStat
                label={tForm('classification')}
                value={data?.details?.classification ?? charT('unknown')}
              />
              <CharacterStat
                label={tForm('affiliation')}
                value={data?.details?.affiliation ?? charT('unknown')}
              />
              <CharacterStat label={tForm('age')} value={data?.details?.age ?? charT('unknown')} />
              <CharacterStat
                label={tForm('skills')}
                value={data?.details?.skills ?? charT('unknown')}
              />
            </div>
          </SectionContent>
        </Section>
        {data?.titles.length > 0 ? (
          <Section>
            <SectionTitle>Тайтлы</SectionTitle>
            <SectionContent className="flex flex-col gap-2">
              {data?.titles.map((it) => (
                <HorizontalTitleCard
                  key={it.id}
                  model={it}
                  className="border-border bg-background rounded-md border p-2"
                />
              ))}
            </SectionContent>
          </Section>
        ) : null}
        <Section>
          <SectionTitle>{tSections('cards')}</SectionTitle>
          <SectionContent>
            <FlatList.Root className="w-full" hasNextPage={hasNextPage} content={cards}>
              <FlatList.Layout layout="grid">
                <FlatList.Content>
                  {({ item, attributes }) => (
                    <HeroCard
                      key={item.id}
                      card={item}
                      withHover
                      {...attributes}
                      onClick={() => {
                        setCard(item);
                      }}
                    />
                  )}
                </FlatList.Content>
                <FlatList.Loading count={5}>
                  {({ key }) => <HeroCard loading key={key} />}
                </FlatList.Loading>
                <FlatList.EdgeTrigger onTrigger={fetchNextPage} canTrigger={hasNextPage} />
                <FlatList.Empty className="col-span-full" text={tEmpty('empty')} emoji="🎴" />
              </FlatList.Layout>
            </FlatList.Root>
          </SectionContent>
        </Section>
      </EntityLayoutContent>
    </EntityLayoutRoot>
  );
};
