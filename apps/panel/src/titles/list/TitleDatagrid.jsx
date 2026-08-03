import { BooleanField, NumberField } from 'react-admin';

import { CustomDatagrid } from '../../common/components/CustomDatagrid.jsx';
import TitleInfoField from '../common/TitleInfoField.jsx';
import TitleTypeStatusField from '../common/TitleTypeStatusField.jsx';

export const TitleDatagrid = (props) => {
    return (
        <CustomDatagrid
            bulkActionButtons={false}
            // header={() => null}
            rowClick="show"
            {...props}
        >
            <TitleInfoField clickable={false} />
            <TitleTypeStatusField color="text" variant="caption" label="Статус" />
            <NumberField source="count_chapters" textAlign="center" label="Глав" />
            <BooleanField source="is_licensed" label="Лиц." />
            <BooleanField source="is_erotic" label="18+" />
            <BooleanField source="is_yaoi" label="Яой" />
            <NumberField source="id" />
        </CustomDatagrid>
    );
};
