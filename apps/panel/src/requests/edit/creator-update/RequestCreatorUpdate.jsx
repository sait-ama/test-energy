import React from 'react';

import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

import { CompareBase } from '../../../common/fields/comparison/CompareBase';
import { ComparisonLabel } from '../../../common/fields/comparison/ComparisonLabel';
import { ImageComparisonField } from '../../../common/fields/comparison/ImageComparisonField';
import { SelectComparisonField } from '../../../common/fields/comparison/SelectComparisonField';
import { TextComparisonField } from '../../../common/fields/comparison/TextComparisonField';
import { useTouchChangedFields } from '../../../common/hooks/useTouchChangedFields.js';
import useCreatorTypes from '../../../hooks/useCreatorTypes';
import { useOpen } from '../../../hooks/useOpen';

export const RequestCreatorEdit = () => {
    const [hidden, toggle] = useOpen(true);
    const { list, isLoading } = useCreatorTypes();

    useTouchChangedFields();

    if (isLoading) return null;

    return (
        <>
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
                    fieldName="cover"
                    prevBaseName="old_data"
                    currentBaseName="data"
                    label="Картинка"
                    hidden={hidden}
                />

                <TextComparisonField
                    fieldName="name"
                    prevBaseName="old_data"
                    currentBaseName="data"
                    label="Основное название"
                    hidden={hidden}
                />
                <TextComparisonField
                    fieldName="alt_name"
                    prevBaseName="old_data"
                    currentBaseName="data"
                    label="Альт название"
                    hidden={hidden}
                />

                {/*<CustomRichTextInput*/}
                {/*    fieldName="description"*/}
                {/*    label="Описание"*/}
                {/*    hidden={hidden}*/}
                {/*/>*/}

                <SelectComparisonField
                    fieldName="type"
                    prevBaseName="old_data"
                    currentBaseName="data"
                    label="Тип"
                    choices={list.type}
                    hidden={hidden}
                />

                <SelectComparisonField
                    fieldName="country"
                    label="Страна"
                    prevBaseName="old_data"
                    currentBaseName="data"
                    choices={list.country}
                    hidden={hidden}
                />
            </div>
        </>
    );
};
