import React from 'react';
import {
    BooleanField,
    DateField,
    FunctionField,
    NumberField,
    TextField
} from 'react-admin';

import { CustomDatagrid } from '../../common/components/CustomDatagrid.jsx';

export const NotificationsDatagrid = (props) => {
   return  <CustomDatagrid rowClick={false} bulkActionButtons={false} {...props}>
        <DateField source="date" showTime label="Дата" />
        <FunctionField label="Тип" render={(record) => record.type === 0? 'Обновления' : record.type === 1 ? 'Социальное' : 'Важное' } />
        <TextField source="text" label="Сообщение" />
        <BooleanField source="status" label="Прочитано" />
        <NumberField source="id" label="id" />
    </CustomDatagrid>
}