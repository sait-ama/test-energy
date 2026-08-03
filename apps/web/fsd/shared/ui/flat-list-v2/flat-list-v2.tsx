'use client';
import type { ComponentProps, ComponentPropsWithoutRef, ReactNode } from 'react';
import { memo, useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import { createContext } from '@re/core/utils/create-context';
import { Slot } from '@re/ui-kit/ui/slot';
import { cn } from '@re/ui-kit/utils/cn';

import { useEventCallback } from '~shared/hooks/use-event-callback';
import type { EmptyViewProps } from '~shared/ui/empty-view';
import { EmptyView } from '~shared/ui/empty-view';

type ItemSchema<T extends Record<string, unknown> | unknown = unknown> = {
  id?: string | number;
} & T;

export interface FlatListContext<T extends ItemSchema[]> {
  isEmpty?: boolean;
  isLoading?: boolean;
  isFetching?: boolean;
  isFetchingNextPage?: boolean;
  isFetchingPreviousPage?: boolean;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  content: T;
}

export const { useStore: useFlatListContext, Provider: FlatListContextProvider } = createContext<
  FlatListContext<ItemSchema[]>,
  FlatListContext<ItemSchema[]>
>((data) => data);

type FlatListView = 'grid' | 'list' | 'none';

export interface FlatListLayout {
  container: string;
  child: string;
  root?: string;
}

const layouts: Record<Exclude<FlatListView, 'none'>, FlatListLayout> = {
  grid: {
    container:
      'grid gap-2 w-full sm:grid-cols-4 lg:grid-cols-7 xs:grid-cols-4 grid-cols-3 md:grid-cols-6',
    child: 'w-full h-auto',
  },
  list: {
    container: 'grid gap-2 w-full grid-cols-1 md:grid-cols-2',
    child: 'w-full h-auto',
  },
};

const getLayout = (layout: FlatListView | FlatListLayout, type: keyof FlatListLayout) => {
  if (layout === 'none') return null;
  if (typeof layout === 'string') return layouts[layout][type];
  return layout[type];
};

export interface FlatListRootProps<T>
  extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'content'> {
  content?: T;
  isLoading?: boolean;
  isFetching?: boolean;
  isFetchingNextPage?: boolean;
  isFetchingPreviousPage?: boolean;
  children?: ReactNode;
  className?: string;
  asChild?: boolean;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  isEmpty?: boolean;
}

function FlatListRootInner<T extends ItemSchema[]>(props: FlatListRootProps<T>) {
  const {
    content = [] as unknown as T,
    isLoading = false,
    isFetchingNextPage = false,
    isFetchingPreviousPage = false,
    hasPreviousPage = false,
    hasNextPage = false,
    asChild,
    className,
    children,
    isEmpty: isEmptyOverride,
    ...rest
  } = props;

  const isEmpty =
    typeof isEmptyOverride !== 'undefined'
      ? isEmptyOverride
      : !isLoading && !content.length && !hasNextPage;

  const context: FlatListContext<T> = {
    isEmpty,
    isLoading,
    isFetchingNextPage,
    isFetchingPreviousPage,
    hasPreviousPage,
    hasNextPage,
    content,
  };

  const Comp = asChild ? Slot : 'div';

  return (
    <FlatListContextProvider value={context as unknown as FlatListContext<ItemSchema<T>>}>
      <Comp className={className} {...rest}>
        {children}
      </Comp>
    </FlatListContextProvider>
  );
}

export const FlatListRoot = memo(FlatListRootInner) as <T>(
  props: FlatListRootProps<T>
) => ReturnType<typeof FlatListRootInner>;

export interface FlatListHeaderProps extends ComponentProps<'div'> {
  children: ReactNode;
  asChild?: string;
}

export const FlatListHeader = (props: FlatListHeaderProps) => {
  const { children, asChild, ...rest } = props;
  const Comp = asChild ? Slot : 'div';
  // @ts-ignore
  return <Comp {...rest}>{children}</Comp>;
};

export const FlatListFooter = FlatListHeader;

export interface FlatListLayoutProps extends ComponentPropsWithoutRef<'div'> {
  layout?: FlatListLayout | FlatListView;
  children?: ReactNode;
  className?: string;
  asChild?: boolean;
}

export const FlatListLayout = (props: FlatListLayoutProps) => {
  const { layout = 'none', asChild, className, ...rest } = props;
  const Component = asChild ? Slot : 'div';
  const layoutClassName = getLayout(layout, 'container');
  return <Component className={cn('relative', layoutClassName, className)} {...rest} />;
};

export interface FlatListContainerProps extends FlatListLayoutProps {}

export const FlatListContainer = (props: FlatListContainerProps) => {
  const isEmpty = useFlatListContext((v) => v.isEmpty);
  if (isEmpty) return props.children;
  return <FlatListLayout {...props} />;
};

export type FlatListEmptyContentContainer = { children: ReactNode };

export const FlatListEmptyContentContainer = (props: FlatListEmptyContentContainer) => {
  const { children } = props;
  const isEmpty = useFlatListContext((v) => v.isEmpty);
  if (isEmpty) return null;
  return children;
};

export type FlatListItemRenderer<T> = (options: {
  item: ItemSchema<T>;
  index: number;
  attributes: Record<string, string | number>;
}) => ReactNode;

export interface FlatListContentProps<T> {
  children: FlatListItemRenderer<T>;
  dataIndexKeyFactory?: (item: T, index: number) => string | number;
}
const defaultDataKeyFactory = <T,>(item: ItemSchema<T>, index: number) => {
  return item?.id ?? index;
};
export const FlatListContent = <T,>(props: FlatListContentProps<T>) => {
  const { children, dataIndexKeyFactory = defaultDataKeyFactory } = props;
  const { content } = useFlatListContext((v) => v);
  return (
    <FlatListEmptyContentContainer>
      {(content as ItemSchema<T>[]).map((item, index) => {
        const dataIndex = dataIndexKeyFactory(item, index);
        const attributes = { 'data-index': dataIndex };
        return children({ item, index, attributes });
      })}
    </FlatListEmptyContentContainer>
  );
};

export interface FlatListLoadingProps {
  count: number;
  children: (options: { key: string; index: number }) => ReactNode;
  type?: 'prev' | 'next';
  __forceLoading?: boolean;
}

export const FlatListLoading = memo(
  (props: FlatListLoadingProps) => {
    const { count, children, type = 'next', __forceLoading } = props;
    const { isEmpty, isLoading, isFetchingNextPage, isFetchingPreviousPage, content } =
      useFlatListContext<FlatListContext<ItemSchema<unknown>[]>>((v) => v);

    const isFetching =
      __forceLoading ||
      (type === 'next' ? isFetchingNextPage : isFetchingPreviousPage) ||
      isLoading;

    if (!isFetching || isEmpty) return null;

    if (typeof children !== 'function') return children;

    return Array.from({ length: count }).map((_, i) =>
      children({ key: `l-${i + content.length}`, index: i })
    );
  },
  (prevProps, nextProps) =>
    prevProps.count === nextProps.count &&
    prevProps.type === nextProps.type &&
    prevProps.children === nextProps.children
);

export type FlatListEmptyProps =
  | { children: ReactNode; asChild: true }
  | ({ asChild?: false | null | undefined } & EmptyViewProps);

export const FlatListEmpty = (props: FlatListEmptyProps) => {
  const { asChild, ...rest } = props;
  const isEmpty = useFlatListContext((v) => v.isEmpty);
  if (!isEmpty) return null;
  return asChild ? <Slot {...rest} /> : <EmptyView height="40vh" {...rest} />;
};

interface FlatListEdgeTrigger {
  onTrigger: (options?: { cancelRefetch?: boolean }) => Promise<unknown> | void;
  canTrigger?: boolean;
  position?: 'top' | 'bottom';
}

export const FlatListEdgeTrigger = (props: FlatListEdgeTrigger) => {
  const { onTrigger, position = 'bottom', canTrigger = false } = props;

  const [inView, setInView] = useState(false);
  const [inViewRef] = useInView({
    threshold: 0.5,
    trackVisibility: true,
    delay: 300,
    onChange: setInView,
  });

  const { isEmpty, isFetchingNextPage, isFetchingPreviousPage } = useFlatListContext((v) => v);

  const isFetching = position === 'top' ? isFetchingPreviousPage : isFetchingNextPage;

  const memoizedTriggerFunction = useEventCallback(onTrigger);

  useEffect(() => {
    if (inView && canTrigger && !isFetching) {
      memoizedTriggerFunction();
    }
  }, [inView, canTrigger, memoizedTriggerFunction, isFetching]);

  if (isEmpty) return null;

  return (
    <div
      className={cn(
        'absolute z-[-1] h-10 w-10 outline-red-50',
        position === 'top' ? 'top-0' : 'bottom-0'
      )}
      ref={inViewRef}
    />
  );
};

export const FlatListCustomContent = ({ children }: { children: ReactNode }) => {
  const { isEmpty, content } = useFlatListContext<FlatListContext<ItemSchema[]>>((v) => v);
  return useMemo(() => (isEmpty ? null : children), [children, isEmpty, content]);
};

export interface FlatListType<T extends unknown[]> {
  Root: typeof FlatListRoot<T>;
  Header: typeof FlatListHeader;
  Content: typeof FlatListContent<T[0]>;
  EmptyContentContainer: typeof FlatListEmptyContentContainer;
  Container: typeof FlatListContainer;
  Loading: typeof FlatListLoading;
  Empty: typeof FlatListEmpty;
  Footer: typeof FlatListFooter;
  Layout: typeof FlatListLayout;
  EdgeTrigger: typeof FlatListEdgeTrigger;
}

export const FlatList = {
  Root: FlatListRoot,
  Header: FlatListHeader,
  Content: FlatListContent,
  EmptyContentContainer: FlatListEmptyContentContainer,
  Container: FlatListContainer,
  Layout: FlatListLayout,
  Loading: FlatListLoading,
  Empty: FlatListEmpty,
  Footer: FlatListFooter,
  EdgeTrigger: FlatListEdgeTrigger,
};
