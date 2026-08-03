import React from 'react';
import { DateField, FunctionField, NumberField, ReferenceManyField } from 'react-admin';

import { CustomDatagrid } from 'src/common/components/CustomDatagrid';
import TitleInfoField from 'src/titles/common/TitleInfoField';

export const UserBuys = () => {
    return (
        <ReferenceManyField target="user_id" source="id" label="Расходы" reference="user_buy">
            <CustomDatagrid rowClick="edit" bulkActionButtons={false}>
                <NumberField source="id" label="id" />
                <FunctionField
                    label="Контент"
                    render={(record) =>
                        'chapter' in record ? `Глава - ${record.chapter.chapter}` : `Том - ${record.volume.name}`
                    }
                />
                <FunctionField
                    label="Тайтл"
                    render={(record) => {
                        if ('chapter' in record && record.chapter?.title) {
                            return <TitleInfoField source="chapter.title" clickable />;
                        }

                        if (record.volume?.branch?.title) {
                            return <TitleInfoField source="volume.branch.title" clickable />;
                        }

                        return '-';
                    }}
                />
                <FunctionField label="Тип оплаты" render={(record) => (record.ticket ? 'Тикеты' : 'Денюжки')} />
                <FunctionField
                    label="Списание"
                    render={(record) => (
                        <span style={{ color: 'red' }}>-{record.ticket ? record.ticket.sum : record.payment.sum}</span>
                    )}
                />
                <DateField source="date" showTime label="Дата" />
            </CustomDatagrid>
        </ReferenceManyField>
    );
};
