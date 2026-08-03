import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';

import { useTitleRelations } from '~entities/title/model/queries';
import { HorizontalTitleCard } from '~entities/title/ui/horizontal-title-card';
import type { EndpointMeta } from '~shared/api/api-toolkit';
import type { TitleRelationItem, TitleRelationsListParamsSchema } from '~shared/api/models/title';
import type { FlatListType } from '~shared/ui/flat-list-v2';
import { FlatList as _FlatList } from '~shared/ui/flat-list-v2';

interface RelationsListProps {
  variables: EndpointMeta<TitleRelationsListParamsSchema, void>;
}

export const RelationsList = (props: RelationsListProps) => {
  const { variables } = props;
  const { data } = useTitleRelations({ variables });

  const FlatList: FlatListType<TitleRelationItem[]> = _FlatList;

  return (
    <FlatList.Root content={data.titles}>
      <ScrollArea>
        <div className="flex gap-2">
          <FlatList.Content>
            {({ item }) => <HorizontalTitleCard model={item.title} />}
          </FlatList.Content>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <FlatList.Empty>Ничего нет, но это можно исправить, пошуршав в интернете</FlatList.Empty>
    </FlatList.Root>
  );
};
