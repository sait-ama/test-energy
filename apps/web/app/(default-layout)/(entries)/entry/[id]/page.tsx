import { notFound } from 'next/navigation';

import { captureException } from '@sentry/nextjs';

import { entriesRetrieve } from '@re/api/generated/sdk.gen';

import { getEntryMetadataValue } from '~entities/entry/model/utils';
import { EntryContent, EntryRoot, EntryTitle } from '~entities/entry/ui/entry';
import { EntryBreadcrumbsLd } from '~pages/entry/seo/ld';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { NextPageParams } from '~shared/types/next';

export const generateMetadata = fallbackDefaultMetadata<{ id: string }>(async (props) => {
  const { id } = await props.params;
  const entry = await entriesRetrieve<true>({
    path: { entry_id: Number(id) },
    throwOnError: true,
  }).then((v) => v.data.content!);
  return getEntryMetadataValue(entry);
});

export default async function Entry(props: NextPageParams<{ id: string }>) {
  const params = await props.params;
  try {
    const { header, text } = await entriesRetrieve({
      path: { entry_id: Number(params.id) },
      throwOnError: true,
    }).then((v) => v.data!.content!);

    return (
      <>
        <EntryBreadcrumbsLd dir={params.id} name={header} />
        <EntryRoot>
          <EntryTitle>{header}</EntryTitle>
          <EntryContent>{text}</EntryContent>
        </EntryRoot>
      </>
    );
  } catch (e: unknown) {
    captureException(e);
    notFound();
  }
}

export const dynamic = 'force-dynamic';
