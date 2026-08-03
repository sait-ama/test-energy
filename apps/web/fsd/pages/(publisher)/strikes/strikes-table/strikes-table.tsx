'use client';

import { useStrikesQuery } from '~entities/publisher/model/queries';
import { usePublisherVariables } from '~pages/(publisher)/helpers/use-publisher-variables';
import { useStrikesColumns } from '~pages/(publisher)/strikes/strikes-table/column';
import { DataTable } from '~shared/ui/data-table';

export const StrikesTable = () => {
  const { publisherId } = usePublisherVariables();
  const { data: { results: tableData = [] } = {} } = useStrikesQuery({
    variables: { params: { publisherId: publisherId } },
  });
  const columns = useStrikesColumns();
  return <DataTable columns={columns} withoutHeader data={tableData} />;
};
