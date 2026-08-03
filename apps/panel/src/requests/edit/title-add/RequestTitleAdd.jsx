import { Labeled, useRecordContext } from 'react-admin';

import { Box } from '@mui/material';
import Divider from '@mui/material/Divider';

import { CustomArrayAutocomplete } from '../../../common/fields/AutoCompleteArray';
import { CustomImage } from '../../../common/fields/ImageField.jsx';
import { CustomRichTextInput } from '../../../common/fields/RichTextInput';
import { CustomSelect } from '../../../common/fields/Select';
import { CustomTextInput } from '../../../common/fields/TextInput';
import useTitleTypes from '../../../hooks/useTitleTypes.js';

export const RequestTitleAdd = () => {
    const { list: titleForms, isLoading: titleFormsLoading } = useTitleTypes();
    const record = useRecordContext();

    if (titleFormsLoading) return null;

    return (
        <>
            <div className="flex flex-col w-full justify-around mb-4">
                <div className="flex w-full">
                    <Labeled label="Обои">
                        <CustomImage
                            src={record?.data?.wallpaper}
                            sx={{
                                width: '100%',
                            }}
                            style={{
                                maxHeight: 600
                            }}
                        />
                    </Labeled>
                </div>
                <div className="flex gap-8 items-center">
                    <div className="flex" style={{ width: 200 }}>
                        <Labeled label="Обложка">
                            <CustomImage
                                src={record?.data?.cover}
                                sx={{
                                    width: 200,
                                }}
                            />
                        </Labeled>
                    </div>
                    <div className="flex flex-col w-full">
                        <CustomTextInput source="data.main_name" label="Основное название" />
                        <CustomTextInput source="data.secondary_name" label="Второстепенное название" />
                        <CustomTextInput source="data.another_name" label="Другое название" />
                    </div>
                </div>
            </div>
            <CustomRichTextInput source="data.description" label="Описание" toolbar={() => null} />
            <div className="flex gap-4 w-full">
                <CustomArrayAutocomplete
                    source="data.categories"
                    optionValue="id"
                    choices={titleForms?.categories}
                    label="Категории"
                />
                <CustomArrayAutocomplete source="data.genres" choices={titleForms.genres} label="Жанры" />
            </div>
            <div className="flex w-full gap-4">
                <CustomSelect source="data.type" label="Тип" choices={titleForms.types} />
                <CustomSelect source="data.status" label="Статус проекта" choices={titleForms.status} />
                <CustomSelect
                    source="data.translate_status"
                    label="Статус перевода"
                    choices={titleForms.translate_status}
                />
            </div>
            <div className="flex gap-4 w-full">
                <CustomSelect source="data.age_limit" label="Возрастное ограничение" choices={titleForms.age_limit} />
                <CustomTextInput source="data.issue_year" label="Год выпуска" />
            </div>
            <div className="flex gap-4 w-full">
                <CustomArrayAutocomplete
                    source="data.publishers"
                    choices={titleForms?.publishers}
                    label="Переводчик/автор/издатель"
                />
            </div>
            <div>
                <Divider>Ссылки</Divider>
                <Box sx={{ my: 2 }}>
                    {Object.keys(record.data?.additional ?? {}).map((key) => (
                        <CustomTextInput source={`data.additional.${key}`} />
                    ))}
                </Box>
            </div>
        </>
    );
};
