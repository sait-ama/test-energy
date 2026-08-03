import { useParams, usePathname } from 'next/navigation';

import { useRouter } from '@bprogress/next';

import { useContentType } from '~app/providers/site-config-provider';
import { CHAPTER_ORDERING_DEFAULT, ChapterOrdering } from '~shared/api/models/chapter';
import { Features } from '~shared/config/feature-flags';
import { Routing } from '~shared/config/routing';
import { useQueryState } from '~shared/hooks/use-query-state-v2';

import { TitleDetailPageTabs, TitleDetailPageTabsList } from './const';
import { useCurrentPageSuspenseTitleDetail } from './queries';
import type { TitleDetailPageParams } from './type';

export const useTitleTabs = () => {
  const { dir } = useParams<TitleDetailPageParams>();
  const contentType = useContentType();
  const pathnameArray = usePathname().split('/') || '';
  const tab = pathnameArray[pathnameArray.length - 1];

  const resolvedTab = TitleDetailPageTabsList.find((item) => {
    if (item?.feature) return Features[item?.feature] && item.value === tab;
    return item.value === tab;
  })
    ? tab
    : TitleDetailPageTabs.MAIN;

  const router = useRouter();

  const setTab = (newTab: string) => {
    router.push(Routing.Title.detail({ params: { content: contentType, dir, tab: newTab } }));
  };
  return { tab: resolvedTab, setTab };
};

export const useChapterTabOrdering = () =>
  useQueryState<string, string>({
    key: 'ordering',
    variants: Object.values(ChapterOrdering),
    defaultValue: CHAPTER_ORDERING_DEFAULT,
  });

export const useChapterTabQuery = () =>
  useQueryState<string, string>({ key: 'query', defaultValue: '' });

export const useCurrentTitleBranch = () => {
  const { data: title } = useCurrentPageSuspenseTitleDetail();

  const activeBranch = title?.branches.find((item) => item.subscribed) || title?.branches[0];
  const variants = title?.branches.map((branch) => String(branch.id)) || [];

  return useQueryState<string, string>({
    key: 'branch',
    variants,
    defaultValue: activeBranch ? String(activeBranch.id) : '',
  });
};
