import type { ReactNode } from 'react';
import { useParams } from 'next/navigation';

import { useTitleDetail } from '~entities/title/model/queries';
import { Media } from '~shared/lib/media';
import { Display } from '~shared/lib/media/const';

import { TitleDetailPageTabs } from './const';

export interface TabVisibilityControlProps {
  tab: TitleDetailPageTabs;
  children: ReactNode;
}

export const TabVisibilityControl = ({ tab, children }: TabVisibilityControlProps) => {
  const params = useParams();
  const { data: title } = useTitleDetail({ variables: { params: { dir: params.dir } } });

  const {
    count_anime,
    count_cards,
    count_moments,
    count_characters,
    count_posts,
    has_voiceover,
    can_post_comments,
  } = title || {};
  switch (tab) {
    case TitleDetailPageTabs.CARDS:
      return count_cards ? children : null;

    case TitleDetailPageTabs.CHARACTERS:
      return count_characters ? children : null;

    case TitleDetailPageTabs.POSTS:
      return count_posts ? children : null;

    case TitleDetailPageTabs.VOICEOVER:
      return has_voiceover ? children : null;

    case TitleDetailPageTabs.ANIME:
      return count_anime ? children : null;

    case TitleDetailPageTabs.MOMENTS:
      return count_moments ? children : null;

    case TitleDetailPageTabs.COMMENTS:
      return can_post_comments ? <Media lessThan={Display.md}>{children}</Media> : null;

    default:
      return children;
  }
};
