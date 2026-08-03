import { redirect } from 'next/navigation';

import { Routing } from '~shared/config/routing';
import { getContentType } from '~shared/config/site-config';
import { NextPageParams } from '~shared/types/next';
import TitleDetailTabs = Routing.Title.TitleDetailTabs;

export default async function TitleOldVersionPage(props: NextPageParams<{ dir: string }>) {
  const { dir } = await props.params;
  const contentType = getContentType();
  redirect(
    Routing.Title.detail({ params: { dir, content: contentType, tab: TitleDetailTabs.MAIN } })
  );
}
