import { useRecordContext } from 'react-admin';

import { Box, FormControlLabel, Switch } from '@mui/material';
import { AutocompleteComparisonField } from 'src/common/fields/comparison/AutocompleteComparisonField';
import { BooleanComparisonField } from 'src/common/fields/comparison/BooleanComparisonField';
import { CompareBase } from 'src/common/fields/comparison/CompareBase';
import { ComparisonLabel } from 'src/common/fields/comparison/ComparisonLabel';
import { ReferenceComparisonField } from 'src/common/fields/comparison/ReferenceComparisonField';
import { RichTextComparisonField } from 'src/common/fields/comparison/RichTextComparisonField';
import useMomentTagTypes from 'src/hooks/useMomentTagTypes';
import { useOpen } from 'src/hooks/useOpen';

import TitleInfoField from '../../../titles/common/TitleInfoField.jsx';

const settings = {
    prevBaseName: 'old_data',
    currentBaseName: 'data',
};

export const RequestMomentUpdate = () => {
    const [hidden, toggle] = useOpen(true);
    const { list, isLoading } = useMomentTagTypes();
    const record = useRecordContext();

    if (isLoading || !record) return null;

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

                <ReferenceComparisonField
                    {...settings}
                    label="Тайтл"
                    fieldName="title"
                    prevBaseName="old_data"
                    reference="titles"
                    target="id"
                    hidden={hidden}
                >
                    <TitleInfoField clickable />
                </ReferenceComparisonField>

                <RichTextComparisonField {...settings} fieldName="description" label="Описание" hidden={hidden} />
                <Box>
                    <BooleanComparisonField {...settings} fieldName="is_spoiler" label="Спойлер" hidden={hidden} />
                </Box>
                <Box>
                    <AutocompleteComparisonField
                        {...settings}
                        fieldName="tags"
                        label="Тэги"
                        choices={list}
                        hidden={hidden}
                    />
                </Box>
            </div>
        </>
    );

    // return (
    //     <Box display="flex" gap={2}>
    //         <CompareBase
    //             left={null}
    //             right={
    //                 <FormControlLabel
    //                     control={<Switch checked={hidden} onChange={toggle} name="hidden" size="small" />}
    //                     label="Показать только измененные значения"
    //                     style={{ marginLeft: 'auto' }}
    //                     componentsProps={{
    //                         typography: {
    //                             sx: { fontSize: 14, marginLeft: 1 },
    //                         },
    //                     }}
    //                 />
    //             }
    //         />
    //         <Labeled label="Аватар">
    //             <ImageComparisonField
    //                 {...settings}
    //                 fieldName="cover"
    //                 label="Картинка"
    //                 hidden={hidden}
    //                 fieldStyle={{ width: 200 }}
    //             />
    //         </Labeled>
    //         <Box>
    //             <Labeled sx={{ mb: 2 }}>
    //                 <ReferenceComparisonField
    //                     {...settings}
    //                     label="Тайтл"
    //                     fieldName="title"
    //                     prevBaseName="old_data"
    //                     reference="titles"
    //                     target="id"
    //                     hidden={hidden}
    //                 >
    //                     <TitleInfoField clickable />
    //                 </ReferenceComparisonField>
    //             </Labeled>
    //             <RichTextComparisonField {...settings} fieldName="description" label="Описание" hidden={hidden} />
    //             <Box>
    //                 <Labeled>
    //                     <BooleanInput />
    //                     <BooleanComparisonField {...settings} fieldName="is_spoiler" label="Спойлер" hidden={hidden} />
    //                 </Labeled>
    //             </Box>
    //             <Box>
    //                 <CustomArrayAutocomplete source="data.tags" optionValue="id" choices={list} label="Категории" />
    //                 <AutocompleteComparisonField
    //                     {...settings}
    //                     fieldName="tags"
    //                     label="Категории"
    //                     choices={list}
    //                     hidden={hidden}
    //                 />
    //             </Box>
    //         </Box>
    //     </Box>
    // );
};
