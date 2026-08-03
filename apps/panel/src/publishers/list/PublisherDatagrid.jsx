import { NumberField, TextField } from 'react-admin';

import { CustomDatagrid } from '../../common/components/CustomDatagrid.jsx';
import PublisherInfoField from '../components/PublisherInfoField.jsx';
import PublisherTypeField from '../components/PublisherTypeField.jsx';

export const PublisherDatagrid = (props) => {
    return (
        <CustomDatagrid rowClick="show" bulkActionButtons={false} {...props}>
            <PublisherInfoField clickable={false} />
            <PublisherTypeField source="type" sortBy="type" label="Тип" />
            <TextField source="count_titles" label="Кол-во тайтлов" />
            <TextField source="count_strikes" label="Кол-во страйков" />
            <TextField source="monetization" label="Монетизация" />
            <NumberField source="id" />
        </CustomDatagrid>
    );
};
