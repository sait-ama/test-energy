import { Labeled, NumberInput, TextInput, useRecordContext } from 'react-admin';

import { CustomImage } from '../../../common/fields/ImageField.jsx';
import { CustomSelect } from '../../../common/fields/Select.jsx';
import useUserTypes from '../../../hooks/useUserTypes.js';

export const ShopImageItemAdd = () => {
    const { list: userForms, isLoading } = useUserTypes();
    const record = useRecordContext();

    if (isLoading) return null;

    return (
        <>
            <Labeled label="Изображение">
                <CustomImage
                    src={record?.data?.image}
                    style={{
                        width: '100%',
                        aspectRatio: record?.data?.type === 'wallpaper' ? '2/1' : '1/1',
                    }}
                />
            </Labeled>
            <TextInput source="data.name" />
            <CustomSelect source="data.type" label="Тип" choices={userForms.shop_items ?? []} />
            <NumberInput source="data.amount" label="Количество" />
            <NumberInput source="data.cost" label="Цена" />
        </>
    );
};
