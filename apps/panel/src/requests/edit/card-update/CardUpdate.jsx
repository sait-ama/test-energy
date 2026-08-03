import React from 'react';

import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

import CharacterInfoField from '../../../characters/components/CharacterInfoField.jsx';
import { CompareBase } from '../../../common/fields/comparison/CompareBase';
import { ComparisonLabel } from '../../../common/fields/comparison/ComparisonLabel';
import { ImageComparisonField } from '../../../common/fields/comparison/ImageComparisonField';
import { ReferenceComparisonField } from '../../../common/fields/comparison/ReferenceComparisonField.jsx';
import { RichTextComparisonField } from '../../../common/fields/comparison/RichTextComparisonField.jsx';
import { SelectComparisonField } from '../../../common/fields/comparison/SelectComparisonField';
import { useTouchChangedFields } from '../../../common/hooks/useTouchChangedFields.js';
import useCardRankTypes from '../../../hooks/useCardRankTypes.js';
import { useOpen } from '../../../hooks/useOpen';
import TitleInfoField from '../../../titles/common/TitleInfoField.jsx';

export const RequestCardUpdate = () => {
    const [hidden, toggle] = useOpen(true);
    const { list, isLoading } = useCardRankTypes();

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
                    fieldSx={{bgcolor: 'background.accent'}}
                />

                <SelectComparisonField
                    fieldName="rank"
                    prevBaseName="old_data"
                    currentBaseName="data"
                    label="Ранг"
                    choices={list.ranks}
                    hidden={hidden}
                />

                <RichTextComparisonField
                    prevBaseName="old_data"
                    currentBaseName="data"
                    fieldName="description"
                    label="Описание"
                    hidden={hidden}
                />

                <ReferenceComparisonField
                    label="Тайтл"
                    reference="titles"
                    fieldName="title"
                    prevBaseName="old_data"
                    currentBaseName="data"
                    target="id"
                >
                    <TitleInfoField clickable />
                </ReferenceComparisonField>

                <ReferenceComparisonField
                    label="Персонаж"
                    reference="characters"
                    fieldName="character"
                    prevBaseName="old_data"
                    currentBaseName="data"
                    target="id"
                >
                    <CharacterInfoField clickable />
                </ReferenceComparisonField>
            </div>
        </>
    );
};
