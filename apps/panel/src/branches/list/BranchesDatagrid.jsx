import { ArrayField, DateField, FunctionField, NumberField, SingleFieldList } from 'react-admin';

import { Box } from '@mui/material';

import { CustomDatagrid } from '../../common/components/CustomDatagrid.jsx';
import PublisherInfoField from '../../publishers/components/PublisherInfoField';

export const BranchesDatagrid = (props) => {
    return (
        <CustomDatagrid
            resource="branches"
            bulkActionButtons={false}
            expand={
                <Box display="flex" flexDirection="column" p={1} alignContent="flexStart">
                    <ArrayField source="publishers">
                        <SingleFieldList linkType={false}>
                            <PublisherInfoField clickable />
                        </SingleFieldList>
                    </ArrayField>
                </Box>
            }
            {...props}
        >
            <NumberField source="id" label="ID" />
            <DateField source="immune_date" label="Иммунитет до" />
            <NumberField source="count_chapters" label="Количество глав" />
            <FunctionField render={(record) => record.publishers.map((it) => it.name).join(', ')} />
        </CustomDatagrid>
    );
};
