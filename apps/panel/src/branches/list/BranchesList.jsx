import { List, SearchInput } from 'react-admin';

import { Pagination } from 'src/common/components/Paginations';

import { BranchesDatagrid } from './BranchesDatagrid';

export const BranchesList = () => {
    return (
        <List
            filters={[<SearchInput source="search" alwaysOn name="search" autoComplete="false" />]}
            perPage={20}
            exporter={false}
            actions={null}
            style={{ width: '100%' }}
            pagination={<Pagination />}
        >
            <BranchesDatagrid rowClick="show" />
        </List>
    );
};
