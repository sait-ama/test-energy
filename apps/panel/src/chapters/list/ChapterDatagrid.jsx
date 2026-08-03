import { BooleanField, DateField, NumberField, ReferenceField, TextField } from 'react-admin';

import { CustomDatagrid } from '../../common/components/CustomDatagrid.jsx';

export const ChapterDatagrid = (props) => {
    return (
        <CustomDatagrid
            bulkActionButtons={false}
            // rowClick="show"
            {...props}
        >
            <TextField source="chapter" label="Глава" />
            <NumberField source="tome" label="Том" />
            <TextField source="name" label="Название" />
            <ReferenceField source="title" reference="titles" label="Тайтл">
                <TextField source="main_name" />
            </ReferenceField>
            <BooleanField source="is_published" label="Опубл." />
            <BooleanField source="is_paid" label="Платная" />
            <DateField source="upload_date" label="Загружено" />
            <NumberField source="score" label="Рейтинг" />
            <NumberField source="id" />
        </CustomDatagrid>
    );
};
