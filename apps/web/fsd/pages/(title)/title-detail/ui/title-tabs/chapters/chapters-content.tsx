'use client';

import type { ComponentPropsWithoutRef } from 'react';

import { cn } from '@re/ui-kit/utils/cn';

import { TitleDetailPageTabs } from '~pages/(title)/title-detail/model/const';
import { useCurrentPageSuspenseTitleDetail } from '~pages/(title)/title-detail/model/queries';
import { NextChapterDate } from '~pages/(title)/title-detail/ui/title-tabs/chapters/next-chapter-date';
import { useBoolean } from '~shared/hooks/use-boolean';
import { TestProps } from '~shared/lib/test/utils/test-props';
import { EmptyView } from '~shared/ui/empty-view';

import { Bundles } from './bundles';
import { ChapterFilters } from './chapter-filters';
import { ChaptersList } from './chapters-list';
import { SelectBranch } from './select-branch';

export interface ChaptersContentProps extends ComponentPropsWithoutRef<'div'> {
  onItemClick?: () => void;
  replaceOnChapterNav?: boolean;
  initialChapterIndex?: number;
  activeChapterId?: number;
}

export const ChaptersContent = (props: ChaptersContentProps) => {
  const {
    onItemClick,
    className,
    replaceOnChapterNav,
    activeChapterId,
    initialChapterIndex,
    ...rest
  } = props;
  const [isSelectingBranch, toggleSelectingBranch] = useBoolean(false);

  if (isSelectingBranch) return <SelectBranch onClose={toggleSelectingBranch} />;

  return (
    <div className={cn('flex flex-col gap-2', className)} {...rest}>
      <Bundles />
      <NextChapterDate />
      <ChapterFilters onOpenSelectBranch={toggleSelectingBranch} />
      <ChaptersList
        activeChapterId={activeChapterId}
        initialChapterIndex={initialChapterIndex}
        onItemClick={onItemClick}
        replaceOnChapterNav={replaceOnChapterNav}
      />
    </div>
  );
};

export const ChapterContentWithBlockRegionCheck = () => {
  const { data: title } = useCurrentPageSuspenseTitleDetail();

  if (title!.meta.is_forbidden_by_country) {
    return <EmptyView emoji="😞" text="Заблокировано в этом регионе" height="20vh" />;
  }

  return (
    <ChaptersContent
      // initialChapterIndex={title?.current_reading?.index ?? 0}
      activeChapterId={title?.current_reading?.id}
      {...TestProps.id(`title-tab-content-${TitleDetailPageTabs.CHAPTERS}`)}
    />
  );
};
