import React from 'react';

import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

import { AutocompleteComparisonField } from '../../../common/fields/comparison/AutocompleteComparisonField';
import { CompareBase } from '../../../common/fields/comparison/CompareBase';
import { ComparisonLabel } from '../../../common/fields/comparison/ComparisonLabel';
import { ImageComparisonField } from '../../../common/fields/comparison/ImageComparisonField';
import { RichTextComparisonField } from '../../../common/fields/comparison/RichTextComparisonField';
import { SelectComparisonField } from '../../../common/fields/comparison/SelectComparisonField';
import { TextComparisonField } from '../../../common/fields/comparison/TextComparisonField';
import { useTouchChangedFields } from '../../../common/hooks/useTouchChangedFields.js';
import { useOpen } from '../../../hooks/useOpen';
import useTitleTypes from '../../../hooks/useTitleTypes.js';
import TitleInfoField from '../../../titles/common/TitleInfoField.jsx';

const settings = {
    prevBaseName: 'old_data',
    currentBaseName: 'data',
};

export const RequestTitleEdit = () => {
    const [hidden, toggle] = useOpen(true);
    const { list: titleForms, isLoading: titleFormsLoading } = useTitleTypes();

    useTouchChangedFields();

    if (titleFormsLoading) return null;

    return (
        <>
            <TitleInfoField source="title" clickable />
            <CompareBase
                left={null}
                right={
                    <FormControlLabel
                        control={<Switch checked={hidden} onChange={toggle} name="hidden" size="small" />}
                        label="Показать только измененные значения"
                        style={{ marginLeft: 'auto' }}
                        componentsProps={{
                            typography: {
                                sx: { fontSize: 14, marginLeft: 1 },
                            },
                        }}
                    />
                }
            />
            <div className="flex flex-col w-full mt-6">
                <ComparisonLabel />

                <ImageComparisonField
                    {...settings}
                    fieldName="cover"
                    label="Картинка"
                    hidden={hidden}
                    fieldStyle={{ width: 200 }}
                />
                <ImageComparisonField
                    {...settings}
                    fieldName="wallpaper"
                    label="Обои"
                    hidden={hidden}
                    fieldStyle={{ maxHeight: 600 }}
                />

                <TextComparisonField {...settings} fieldName="main_name" label="Основное название" hidden={hidden} />
                <TextComparisonField
                    {...settings}
                    fieldName="secondary_name"
                    label="Второстепенное название"
                    hidden={hidden}
                />
                <TextComparisonField {...settings} fieldName="another_name" label="Другое название" hidden={hidden} />

                <RichTextComparisonField {...settings} fieldName="description" label="Описание" hidden={hidden} />

                <SelectComparisonField
                    {...settings}
                    fieldName="type"
                    label="Тип"
                    choices={titleForms.types}
                    hidden={hidden}
                />

                <AutocompleteComparisonField
                    {...settings}
                    fieldName="genres"
                    label="Жанры"
                    choices={titleForms.genres}
                    hidden={hidden}
                />

                <AutocompleteComparisonField
                    {...settings}
                    fieldName="categories"
                    label="Категории"
                    choices={titleForms.categories}
                    hidden={hidden}
                />

                {/* <ReferenceArrayInput reference="creators" source="data.authors" target="title_id" /> */}

                {/* <ReferenceComparisonField fieldName="authors" label="Авторы" hidden={hidden}> */}
                {/*    <AutocompleteArrayInput />*/}
                {/*</ReferenceComparisonField>*/}
                <SelectComparisonField
                    {...settings}
                    fieldName="status"
                    label="Статус"
                    choices={titleForms.status}
                    hidden={hidden}
                />
                <SelectComparisonField
                    {...settings}
                    fieldName="translate_status"
                    label="Статус перевода"
                    choices={titleForms.translate_status}
                    hidden={hidden}
                />

                <SelectComparisonField
                    {...settings}
                    fieldName="age_limit"
                    label="Возрастное ограничение"
                    choices={titleForms.age_limit}
                    hidden={hidden}
                />
                <TextComparisonField {...settings} fieldName="issue_year" label="Год выпуска" hidden={hidden} />
            </div>
        </>
    );
};
