import { List, SearchInput } from 'react-admin';

import { Pagination } from '../../common/components/Paginations';

import { ChapterDatagrid } from './ChapterDatagrid.jsx';

const ChapterList = () => (
    <List
        sort={{ field: 'id', order: 'ASC' }}
        filters={[<SearchInput source="search" alwaysOn />]}
        exporter={false}
        actions={null}
        bulkActionButtons={false}
        optimized
        sx={{ width: '100%' }}
        pagination={<Pagination />}
    >
        <ChapterDatagrid />
    </List>
);

export default ChapterList;
