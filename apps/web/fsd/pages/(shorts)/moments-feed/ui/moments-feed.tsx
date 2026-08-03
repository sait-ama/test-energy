'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useViewMoment } from '~entities/inventory/model/mutations';
import { MomentShare } from '~features/(moments)/moment-share';
import { ShortsFiltersProvider } from '~features/(moments)/shorts/model/context';
import { useShortsQuery } from '~features/(moments)/shorts/model/use-shorts-query';
import {
  ShortsAsideContent,
  ShortsAsideRoot,
  ShortsAsideTrigger,
} from '~features/(moments)/shorts/ui/aside';
import { ASIDE } from '~features/(moments)/shorts/ui/aside/model/constants';
import { ScrollProvider } from '~features/(moments)/shorts/ui/feed/model';
import { MomentShort, MomentShortRoot, ShortsFeed } from '~features/(moments)/shorts/ui/feed/ui';
import {
  ShortsMenuBar,
  ShortsMenuBarContainer,
  ShortsMenuBarFiltersButton,
  ShortsMenuCommentsButton,
  ShortsMenuLikeButton,
  ShortsMenuOtherActions,
  ShortsMomentSources,
} from '~features/(moments)/shorts/ui/menu-bar';
import { MomentListOrdering, MomentSchema } from '~shared/api/models/inventory';
import { useLogged } from '~shared/lib/session/use-logged';

export const MomentsFeedPage = () => {
  const logged = useLogged();
  const [activeIndex, setActiveIndex] = useState(0);
  const [filters, setFilters] = useState({
    ordering: MomentListOrdering.SCORE_DESC,
  });

  const { data: moments, fetchNextPage, isFetchingNextPage } = useShortsQuery({ filters });

  const filtersStore = useMemo(
    () => ({
      filters,
      setFilters,
    }),
    [filters]
  );

  const moment = useMemo(() => {
    return moments?.[activeIndex];
  }, [activeIndex, moments]);

  const { mutateAsync } = useViewMoment();

  useEffect(() => {
    if (!logged) return;
    if (!moment) return;
    (async () => {
      await mutateAsync({ path: { moment_dir: moment.dir! } });
    })();
  }, [moment, logged]);

  const ShortsItem = useCallback(
    ({ moment }: { moment: MomentSchema }) => (
      <MomentShortRoot moment={moment}>
        <MomentShort />
      </MomentShortRoot>
    ),
    []
  );

  return (
    <ShortsFiltersProvider value={filtersStore}>
      <ShortsAsideRoot>
        <ScrollProvider
          value={{
            data: moments,
            activeIndex,
            setActiveIndex,
          }}
        >
          <ShortsMenuBarContainer>
            <ShortsFeed
              moments={moments}
              Item={ShortsItem}
              onIndexChange={setActiveIndex}
              onEndReached={() => !isFetchingNextPage && fetchNextPage()}
            />
            <ShortsMenuBar
              header={
                <ShortsAsideTrigger asChild value={ASIDE.FILTERS} variant="secondary" circle>
                  <ShortsMenuBarFiltersButton />
                </ShortsAsideTrigger>
              }
              top={<ShortsMomentSources moment={moment} />}
              bottom={<ShortsMenuOtherActions moment={moment} />}
            >
              <ShortsMenuLikeButton moment={moment} />
              <ShortsAsideTrigger asChild value={ASIDE.COMMENTS} variant="secondary" circle>
                <ShortsMenuCommentsButton moment={moment} />
              </ShortsAsideTrigger>
              <MomentShare model={moment} />
            </ShortsMenuBar>
          </ShortsMenuBarContainer>
          <ShortsAsideContent moment={moment} />
        </ScrollProvider>
      </ShortsAsideRoot>
    </ShortsFiltersProvider>
  );
};
