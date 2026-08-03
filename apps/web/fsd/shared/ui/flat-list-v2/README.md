## Structure

```tsx
const Component = () => {
    return (
        <FlatListRoot layout="grid">
            <FlatListContent />
            <FlatListLoading />
            <FlatListEmpty />
        </FlatListRoot>
    );
};
```

### or

```tsx
const Component = () => {
    return (
        <FlatListRoot layout="grid" /* layout=none is default */>
            <FlatListHeader />
            <FlatListContainer>
                <FlatListContent />
                <FlatListLoading />
                <FlatListEmpty /> /* here */
            </FlatListContainer>
            <FlatListEmpty /> /* or here */
            <FlatListFooter />
        </FlatListRoot>
    );
};
```

## Usage

```tsx
// with no FlatList.Content typization
import { FlatList } from '~shared/ui/flat-list-v2';

const Component = () => {
    const { data, isFetching, hasNextPage, fetchNextPage } = useQueryInfinite(/* ... */);

    //memoize if mapped
    const flattenData = useMemo(() => data?.pages.flatMap(/* ... */) || [], [data]);

    return (
        <FlatList.Root content={flattenData} isLoading={isFetching} onEndReached={fetchNextPage} canLoadNext={hasNextPage}>
            {/* item is any */}
            <FlatList.Content>{({ item, ref }) => <ItemView ref={ref} item={item} key={item.id} />}</ItemView>
            <FlatList.Loading count={20}>{({ key }) => <LoadingItemView key={key} />}</LoadingItemView>
        </FlatList.Root>
    );
}
```

```tsx
// FlatList.Content typization :(((
import { FlatList as _FlatList, FlatListType } from '~shared/ui/flat-list-v2';

const Component = () => {
    const { data, isFetching, hasNextPage, fetchNextPage } = useQueryInfinite(/* ... */);

    //memoize if mapped
    const flattenData = useMemo(() => data?.pages.flatMap(/* ... */) || [], [data]);

    // flattedData is ItemSchema[];
    const FlatList: FlatListType<typeof flattenData> = _FlatList;

    return (
        <FlatList.Root content={flattenData} isLoading={isFetching} onEndReached={fetchNextPage} canLoadNext={hasNextPage}>
            {/* item is ItemSchema */}
            <FlatList.Content>{({ item, ref }) => <ItemView ref={ref} item={item} key={item.id} />}</ItemView>
            <FlatList.Loading loadingCount={20}>{({ key }) => <LoadingItemView key={key} />}</LoadingItemView>
        </FlatList.Root>
    );
}
```
