import React from 'react';
import { List, SearchInput } from 'react-admin';

import { Pagination } from '../../common/components/Paginations';

import { TitleDatagrid } from './TitleDatagrid.jsx';

const TitleList = () => (
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
        <TitleDatagrid />
    </List>
);

export default TitleList;
