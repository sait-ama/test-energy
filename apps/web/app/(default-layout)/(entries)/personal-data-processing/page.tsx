import { getEntryCommonMetadata, resolveEntry } from '~entities/entry/model/utils';
import { EntryContent, EntryRoot, EntryTitle } from '~entities/entry/ui/entry';
import { EntryBreadcrumbsLd } from '~pages/entry/seo/ld';

export const generateMetadata = getEntryCommonMetadata;

export default async function PersonalDataProcessing() {
  const { header, text, dir } = await resolveEntry();

  return (
    <>
      <EntryBreadcrumbsLd dir={dir} name={header} />
      <EntryRoot>
        <EntryTitle>{header}</EntryTitle>
        <EntryContent>{text}</EntryContent>
      </EntryRoot>
    </>
  );
}

export const dynamic = 'force-dynamic';
