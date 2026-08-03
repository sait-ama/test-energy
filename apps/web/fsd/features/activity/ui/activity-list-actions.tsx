import type { ReactNode } from 'react';

import { Tabs, TabsList, TabsTrigger } from '@re/ui-kit/ui/tabs';

import { useActivityListContext } from '~entities/activity/model/context';
import { ActivityListActionsContext } from '~features/activity/model/context';
import { useActivityCreateMutation } from '~features/activity/model/mutations';
import type { CommentOrdering } from '~shared/api/models/activity';
import { TestProps } from '~shared/lib/test/utils/test-props';

import { useActionsSublistConnect, useActivityActionsService } from '../model/service';

const ActivityListActionsProvider = ({ children }) => {
  const actions = useActivityActionsService();
  return (
    <ActivityListActionsContext.Provider value={actions}>
      {children}
    </ActivityListActionsContext.Provider>
  );
};

const ActivityListActionsProviderWithSublist = ({ children }) => {
  const actions = useActionsSublistConnect(useActivityActionsService());
  return (
    <ActivityListActionsContext.Provider value={actions}>
      {children}
    </ActivityListActionsContext.Provider>
  );
};

const ActivityInputForm = ({
  children,
}: {
  children?: (values: { onSubmit: (values: any) => Promise<void> }) => ReactNode;
}) => {
  if (!children) {
    throw new Error('ActivityListInput must include on of: children or renderInput function');
  }

  const createMutation = useActivityCreateMutation();

  const props = {
    disabled: createMutation.isPending,
    onSubmit: createMutation.mutateAsync,
  };

  // @ts-ignore
  return children(props);
};

interface ActivityListOrderingTabsProps {
  className?: string;
}

export const ActivityListOrderingTabs = (props: ActivityListOrderingTabsProps) => {
  const { className } = props;
  const { query, setQuery } = useActivityListContext();

  const handleChangeOrdering = (ordering: CommentOrdering) => {
    setQuery({ ordering });
  };

  return (
    <Tabs
      defaultValue={query.ordering ?? '-id'}
      onValueChange={handleChangeOrdering}
      className={className}
    >
      <TabsList size="sm" color="secondary">
        <TabsTrigger value="-id" color="secondary" {...TestProps.id('filter_by_new_btn')}>
          Новые
        </TabsTrigger>
        <TabsTrigger
          value="-score"
          color="secondary"
          {...TestProps.id('filter_by_interesting_btn')}
        >
          Интересные
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

const ActivityListActions = Object.assign(
  {},
  {
    Provider: ActivityListActionsProvider,
    ProviderWithSublist: ActivityListActionsProviderWithSublist,
    OrderingTabs: ActivityListOrderingTabs,
    InputForm: ActivityInputForm,
  }
);

export { ActivityListActions };
