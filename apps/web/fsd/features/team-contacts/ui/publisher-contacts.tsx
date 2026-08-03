'use client';

import { useParams } from 'next/navigation';

import { usePublisherQuery } from '~entities/publisher/model/queries';
import { socialIcons, socialNames } from '~features/team-contacts/model/const';
import {
  EntityLayoutContact,
  EntityLayoutContactsContent,
  EntityLayoutContactsRoot,
  EntityLayoutContactsTitle,
} from '~shared/ui/entity-layout';

export const PublisherContacts = () => {
  const { dir } = useParams<{ dir: string }>();

  const { data } = usePublisherQuery({
    variables: { params: { dir } },
  });

  const links = Object.entries(data!.content.links).filter(([_, value]) => value);

  if (!links.length) return null;

  return (
    <EntityLayoutContactsRoot>
      <EntityLayoutContactsTitle>Контакты</EntityLayoutContactsTitle>
      <EntityLayoutContactsContent className="gap-2">
        {links.map(([key, value]) => (
          <EntityLayoutContact key={key} icon={socialIcons[key]} href={value}>
            {socialNames[key] ?? '[s'}
          </EntityLayoutContact>
        ))}
      </EntityLayoutContactsContent>
    </EntityLayoutContactsRoot>
  );
};
