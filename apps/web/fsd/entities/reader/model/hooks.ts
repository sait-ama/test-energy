'use client';

import {useCallback, useEffect, useRef} from 'react';
import {usePathname} from 'next/navigation';

import {v2ActivityViewPageCreateMutation} from '@re/api/generated/@tanstack/react-query.gen';
import {useMutation, useQueryClient} from '@tanstack/react-query';

import {ChapterEndpoints} from '~entities/chapter/model/endpoints';
import {useChapterView} from '~entities/chapter/model/mutations';
import {useChapterSuspense} from '~entities/chapter/model/queries';
import {ChapterQueryKeys} from '~entities/chapter/model/query-keys';
import {useChapterId, useReader} from '~entities/reader/model/store';
import {client} from '~shared/api/client';
import type {ChapterRetrieveResponseSchema} from '~shared/api/models/chapter';
import {logger} from '~shared/lib/logger';
import {useLogged} from '~shared/lib/session/use-logged';
import {debounce} from '~shared/utils/debounce';
import {publicEnv} from '~shared/utils/env';
import {UrlFormatter} from '~shared/utils/url-formatter';

export const useActiveChapter = () => {
    const activeChapterId = useReader((v) => v.activeChapterId);
    return useChapterSuspense({variables: {params: {chapter: String(activeChapterId)}}});
};

export const useCurrentChapter = () => {
    const chapterId = useChapterId();

    return useChapterSuspense({variables: {params: {chapter: String(chapterId)}}});
};

export const getChapterImagePath = (src: string) => {
    return new URL(src).pathname;
};

const MIN_COUNT_PAGES_TO_READ = 2;

export const useSaveReadProgress = () => {
    const activePageIndex = useReader((v) => v.activePageIndex);
    const activeChapterId = useReader((v) => v.activeChapterId);
    const pagesViewed = useRef(0);
    const logged = useLogged();
    const pathname = usePathname();
    const queryClient = useQueryClient();

    const {mutateAsync: viewChapter} = useChapterView();
    const {mutateAsync: viewPage} = useMutation(v2ActivityViewPageCreateMutation({client}));
    const {data: chapter} = useActiveChapter();

    const length = chapter?.pages?.length ?? 0;

    const lastViewedChapterId = useRef<null | number>(null);
    const readMinimalCount =
        pagesViewed.current > MIN_COUNT_PAGES_TO_READ && length > MIN_COUNT_PAGES_TO_READ;
    const pagesLessThanMinimum = !!length && length < MIN_COUNT_PAGES_TO_READ;
    const isLastPage = activePageIndex + 1 === length;
    const progressConditionSatisfied = readMinimalCount || pagesLessThanMinimum || isLastPage;

    const canViewCheck = useCallback(() => {
        if (!logged || !chapter) return false;

        if (chapter.is_paid) return chapter.is_bought;

        return true;
    }, [logged, chapter]);

    const handle = useCallback(
        debounce(async () => {
            if (!canViewCheck()) return;

            try {
                if (activeChapterId !== lastViewedChapterId.current) {
                    lastViewedChapterId.current = activeChapterId;
                    await viewChapter({chapter: activeChapterId});
                    queryClient.setQueryData(
                        ChapterQueryKeys.detail({params: {chapter: String(activeChapterId)}}),
                        (prev: ChapterRetrieveResponseSchema): ChapterRetrieveResponseSchema => ({
                            ...prev,
                            viewed: true,
                        })
                    );
                    queryClient.removeQueries({
                        predicate: ({queryKey}) => queryKey[0] === ChapterQueryKeys.list({})[0],
                    });
                }

                await viewPage({
                    body: {
                        chapter_id: activeChapterId,
                        page: activePageIndex === length - 1 ? -1 : activePageIndex + 1,
                    },
                });
            } catch (e: unknown) {
                logger.error(e);
            }
        }, 200),
        [activeChapterId, chapter, activePageIndex, canViewCheck]
    );

    useEffect(() => {
        if (progressConditionSatisfied) {
            if (pagesViewed.current || isLastPage) {
                handle();
            }

            pagesViewed.current = 0;
        }
    }, [progressConditionSatisfied, isLastPage]);

    useEffect(() => {
        pagesViewed.current = 0;
        handle();
    }, [pathname]);

    useEffect(() => {
        pagesViewed.current += 1;
    }, [activePageIndex]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                handle();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    useEffect(() => {
        const handleUnload = () => {
            if (!canViewCheck()) return;

            const data = {
                chapter: activeChapterId,
                page: activePageIndex + 1,
            };

            if (data.page === length) {
                data.page = -1;
            }

            navigator.sendBeacon(
                UrlFormatter.createUrl(publicEnv('GATEWAY_URL'), ChapterEndpoints.view()),
                JSON.stringify(data)
            );
        };

        window.addEventListener('beforeunload', handleUnload);
        return () => {
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, [canViewCheck]);
};
