'use client';

import { useParams } from 'next/navigation';

import Admin from '@re/ui-kit/icons/admin';
import Panel from '@re/ui-kit/icons/panel';
import Settings from '@re/ui-kit/icons/settings';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import { useCreatorQuery } from '~entities/creator/model/queries';
import { CreatorAvatar } from '~entities/creator/ui/creator-avatar';
import { AuthorizedLink } from '~shared/lib/auth/authorized-link';
import { StaffOnlyLink } from '~shared/lib/auth/staff-only-link';
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
import { ExpandableV2 } from '~shared/ui/expandable-v2';
import { Section, SectionContent, SectionTitle } from '~shared/ui/section';
import { publicEnv } from '~shared/utils/env';
import { UrlFormatter } from '~shared/utils/url-formatter';
import {
  CatalogDesktopFilters,
  CatalogFiltersContainer,
  CatalogList,
  CatalogMobileFilters,
  CatalogOrdering,
  CatalogRoot,
  CatalogRootContainer,
  CatalogSearch,
  CatalogTitleListContainer,
} from '~widgets/catalog/ui/catalog';

export const CreatorPage = () => {
  const params = useParams();

  const { data } = useCreatorQuery({ variables: { params: { id: params.id } } });

  return (
    <EntityLayoutRoot>
      <EntityLayoutHeader>
        <EntityLayoutAvatarContainer>
          {({ size, priority }) => (
            <CreatorAvatar src={data.cover?.mid} alt={data.name} size={size} priority={priority} />
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
                    `/creators/${params.id}/show`
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
                    `titles/creators/${params.id}/change/`
                  )}
                >
                  <Admin />
                </StaffOnlyLink>
              </Button>
              <Button asChild color="secondary" startIcon={<Settings />}>
                <AuthorizedLink href={`/creator/${data?.id}/edit`}>Изменить</AuthorizedLink>
              </Button>
            </EntityLayoutActions>
          </EntityLayoutTitleContainer>
        </EntityLayoutHeadingContainer>
      </EntityLayoutHeader>

      <EntityLayoutContent slim className="flex flex-col gap-2">
        <Section>
          <SectionTitle>Описание</SectionTitle>
          <SectionContent>
            <ExpandableV2
              rows={3}
              renderContent={() => (
                <ReText
                  size="sm"
                  dangerouslySetInnerHTML={{ __html: data.description || '' }}
                  color="muted-foreground"
                />
              )}
            />
          </SectionContent>
        </Section>
        <Section>
          <CatalogRoot overrides={{ creators: [params.id] }}>
            <SectionTitle aside={<CatalogMobileFilters />}>Тайтлы</SectionTitle>

            <CatalogRootContainer>
              <CatalogTitleListContainer>
                <CatalogFiltersContainer>
                  <CatalogOrdering />
                  <CatalogSearch />
                </CatalogFiltersContainer>
                <CatalogList />
              </CatalogTitleListContainer>
              <CatalogDesktopFilters />
            </CatalogRootContainer>
          </CatalogRoot>
        </Section>
      </EntityLayoutContent>
    </EntityLayoutRoot>
  );
};
