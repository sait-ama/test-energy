import { FilterList, FilterListItem, FilterLiveSearch, List } from 'react-admin';

import { CardContent } from '@mui/material';
import Card from '@mui/material/Card';
import { Pagination } from 'src/common/components/Paginations';

import usePublisherTypes from '../../hooks/usePublisherTypes.js';

import { PublisherDatagrid } from './PublisherDatagrid.jsx';

const PublisherList = () => {
    const { list, isLoading } = usePublisherTypes();

    if (isLoading) return null;

    return (
        <List
            sort={{ field: 'id', order: 'ASC' }}
            aside={
                <Card sx={{ order: -1, mt: 1, mr: 2, width: 200 }}>
                    <CardContent>
                        <FilterLiveSearch source="search" />
                        <FilterList label="Тип">
                            {list.type.map((it) => (
                                <FilterListItem label={it.name} value={{ type: it.id }} />
                            ))}
                        </FilterList>
                        <FilterList label="Монетизация">
                            {list.monetization.map((it) => (
                                <FilterListItem label={it.name} value={{ monetization: it.id }} />
                            ))}
                        </FilterList>
                    </CardContent>
                </Card>
            }
            perPage={20}
            exporter={false}
            actions={null}
            bulkActionButtons={false}
            //    optimized
            style={{ width: '100%' }}
            pagination={<Pagination />}
        >
            <PublisherDatagrid />
        </List>
    );
};

export default PublisherList;
