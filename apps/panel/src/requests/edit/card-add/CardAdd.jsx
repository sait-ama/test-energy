import { FunctionField, Labeled, ReferenceField, useRecordContext } from 'react-admin';

import { Box } from '@mui/material';
import CardAvatar from 'src/cards/components/CardAvatar.jsx';
import { CustomRichTextInput } from 'src/common/fields/RichTextInput.jsx';

import CharacterInfoField from '../../../characters/components/CharacterInfoField.jsx';
import { CustomSelect } from '../../../common/fields/Select.jsx';
import useCardRankTypes from '../../../hooks/useCardRankTypes.js';
import TitleInfoField from '../../../titles/common/TitleInfoField.jsx';
import CharacterCardField from '../CharacterCardList.jsx';

export const RequestCardAdd = () => {
    const { list, isLoading } = useCardRankTypes();
    const record = useRecordContext();

    if (isLoading || !record) return null;

    return (
        <Box display="flex" gap={2}>
            {/* <Labeled label="Аватар">
                <CustomImage
                    src={record.data?.cover}
                    sx={{
                        width: 200,
                        
                    }}
                />
            </Labeled> */}
            <Labeled label="Аватар">
                <CardAvatar record={{ cover: { mid: record?.data?.cover } }} size={200} />
            </Labeled>
            <Box display="flex" flexDirection="column" sx={{ width: '100%' }}>
                <Labeled>
                    <ReferenceField label="Тайтл" reference="titles" source="data.title" target="id">
                        <TitleInfoField clickable />
                    </ReferenceField>
                </Labeled>

                <Labeled>
                    <ReferenceField label="Персонаж" reference="characters" source="data.character" target="id">
                        <CharacterInfoField clickable />
                    </ReferenceField>
                </Labeled>

                <CustomSelect source="data.rank" label="Ранг" choices={list.ranks} />

                <CustomRichTextInput source="data.description" toolbar={() => null} label="Описание" fullWidth />

                <FunctionField render={console.log}/>
                <FunctionField render={(record) =>
                    <CharacterCardField id={record?.data?.character} />
                } />
            </Box>
        </Box>
    );
};
