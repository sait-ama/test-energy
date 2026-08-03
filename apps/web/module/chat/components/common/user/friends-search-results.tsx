import {useDeferredValue, useEffect, useMemo} from 'react';

import {ScrollArea} from '@re/ui-kit/ui/scroll-area';

import {UserSchemaFragment} from '~shared/api/models/user';
import {QuerySuspenseContainer} from '~shared/lib/react-query/query-suspense-container';

import {useSuspenseSearchFriendsPaginatedQuery} from '../../../model/toolkit/queries';
import {LoadingIndicator} from '../../ui/loading-indicator';
import {LoadMorePaginator} from '../load-more';
import {UserListItem} from '../user-item';

type FriendsSearchResultsProps = {
    className?: string;
    searchQuery: string;
    onItemClick: (userId: number, user: UserSchemaFragment) => void;
    getIsSelectedFn?: (user: UserSchemaFragment) => boolean;
    filterUsers?: { id: number; username: string }[];
};

const FriendsSearchResultsInner = ({
                                       searchQuery,
                                       className,
                                       onItemClick,
                                       getIsSelectedFn,
                                       filterUsers,
                                   }: FriendsSearchResultsProps) => {
    const deferredSearchQuery = useDeferredValue(searchQuery);

    const {data, hasNextPage, fetchNextPage, isFetchingNextPage} =
        useSuspenseSearchFriendsPaginatedQuery({searchQuery: deferredSearchQuery});

    const friends = useMemo(() => {
        return data?.pages.flatMap((page) => page.results) || [];
    }, [data]);

    const isSelectedFn = getIsSelectedFn ?? (() => false);

    const filteredFriends = useMemo(() => {
        return friends.filter((friend) => !filterUsers?.some((user) => user.id === friend.id));
    }, [friends, filterUsers]);

    return (
        <>
            {filteredFriends?.length === 0 ? (
                <div className="text-muted-foreground flex w-full flex-1 items-center justify-center p-8">
                    Никого нет
                </div>
            ) : (
                <ScrollArea className={className} style={{maxWidth: '100%'}}>
                    <LoadMorePaginator
                        hasNextPage={hasNextPage}
                        isLoading={isFetchingNextPage}
                        loadNextPage={fetchNextPage}
                    >
                        <div className="flex flex-col gap-1 px-4 py-2">
                            {filteredFriends.map((friend) => (
                                <UserListItem
                                    key={friend.id}
                                    entity={friend as UserSchemaFragment}
                                    onItemClick={onItemClick}
                                    isSelected={isSelectedFn(friend as UserSchemaFragment)}
                                />
                            ))}
                        </div>
                    </LoadMorePaginator>
                </ScrollArea>
            )}
        </>
    );
};

interface FallbackRendererProps {
    resetErrorBoundary: () => void;
    query: string;
}

const FallbackRenderer = (props: FallbackRendererProps) => {
    const {query, resetErrorBoundary} = props;

    useEffect(() => {
        if (query) resetErrorBoundary();
    }, [query]);

    return (
        <div className="text-muted-foreground flex w-full flex-1 items-center justify-center p-4">
            Произошла ошибка при поиске
        </div>
    );
};

const FriendsSearchResults = (props: FriendsSearchResultsProps) => {
    return (
        <QuerySuspenseContainer
            fallback={
                <div className="flex h-full flex-1 flex-col items-center justify-center">
                    <LoadingIndicator/>
                </div>
            }
            fallbackRender={({resetErrorBoundary}) => (
                <FallbackRenderer query={props.searchQuery} resetErrorBoundary={resetErrorBoundary}/>
            )}
        >
            <FriendsSearchResultsInner {...props} />
        </QuerySuspenseContainer>
    );
};

FriendsSearchResults.displayName = 'FriendsSearchResults';

export {FriendsSearchResults};
