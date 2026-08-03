import { FunctionField, List, NumberField, SearchInput } from 'react-admin';

import { Pagination } from 'src/common/components/Paginations';
import CreatorInfoField from 'src/creators/components/CreatorInfoField';

import { CustomDatagrid } from '../../common/components/CustomDatagrid.jsx';
import useCreatorTypes from '../../hooks/useCreatorTypes';

const rowStyle = () => ({
    //    backgroundColor: '#1e1e1e',
    //    marginTop: '20px',
    //    border: 0,
    //    borderRadius: '10px',
});

const CreatorsList = () => {
    const { getNameById, isLoading } = useCreatorTypes();

    if (isLoading) return null;

    return (
        <List
            filters={[<SearchInput source="search" alwaysOn name="search" autoComplete="false" />]}
            perPage={20}
            exporter={false}
            actions={null}
            style={{ width: '100%' }}
            pagination={<Pagination />}
        >
            <CustomDatagrid optimized rowClick="show" rowStyle={rowStyle} bulkActionButtons={false}>
                <CreatorInfoField />
                <FunctionField label="Тип" render={({ type }) => getNameById(type, 'type')} />
                <FunctionField label="Страна" render={({ type }) => getNameById(type, 'country')} />
                <NumberField source="id" />
            </CustomDatagrid>
        </List>
    );
};

export default CreatorsList;
