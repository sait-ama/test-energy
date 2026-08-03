import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import type { TitleDetailPageParams } from '~pages/(title)/title-detail/model/type';
import { getSiteConfig } from '~shared/config/site-config';

export default async function TitleLayoutRoot(props: {
  children: ReactNode;
  params: Promise<TitleDetailPageParams>;
}) {
  const { children } = props;

  const params = await props.params;
  const siteConfig = getSiteConfig()!;

  const redirects = siteConfig.site.redirects;
  const route = redirects.find((it) => it.source === `/${siteConfig.contentType}/${params.dir}`);

  if (route) redirect(route.destination);

  return children;
}
