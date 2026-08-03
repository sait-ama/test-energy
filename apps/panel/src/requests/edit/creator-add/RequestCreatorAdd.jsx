import { useRecordContext } from 'react-admin';

import { CustomImage } from '../../../common/fields/ImageField.jsx';
import { CustomRichTextInput } from '../../../common/fields/RichTextInput';
import { CustomSelect } from '../../../common/fields/Select';
import { CustomTextInput } from '../../../common/fields/TextInput';
import useCreatorTypes from '../../../hooks/useCreatorTypes.js';

export const RequestCreatorAdd = () => {
    const { list, isLoading } = useCreatorTypes();
    const record = useRecordContext();

    if (isLoading || !record) return null;

    return (
        <>
            <div className="flex w-full justify-around mb-4">
                <div className="flex mx-8" style={{ width: 200 }}>
                    <CustomImage
                        src={record?.data?.cover}
                        sx={{
                            width: 200,
                        }}
                    />
                </div>
                <div className="flex flex-col w-full">
                    <CustomTextInput name="data.name" source="data.name" label="Название" />
                    <CustomTextInput name="data.alt_name" source="data.alt_name" label="Альтернативное название" />
                </div>
            </div>
            <CustomRichTextInput
                name="data.description"
                fullWidth
                source="data.description"
                label="Описание"
                toolbar={() => null}
            />
            <div className="flex w-full gap-4">
                <CustomSelect source="data.type" name="data.type" label="Тип" choices={list.type} />
                <CustomSelect source="data.country" name="data.country" label="Страна" choices={list.country} />
            </div>
        </>
    );
};
