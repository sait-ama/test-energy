import { Labeled, Link, ShowBase, TextField, useRecordContext } from 'react-admin';

import { Stack } from '@mui/material';
import CardAvatar from 'src/cards/components/CardAvatar.jsx';
import CardRankField from 'src/cards/components/CardRankField.jsx';
import TitleInfoField from 'src/titles/common/TitleInfoField.jsx';
import UserInfoField from 'src/users/components/UserInfoField.jsx';

import { CardActions } from './Actions.jsx';

const LinkComp = () => {
    const record = useRecordContext();
    const id = record?.id;
    return (
        <Link to={`${import.meta.env.VITE_URL}/card/${id}`} target="_blank">
            Ссылка на ремангу
        </Link>
    );
};

export const CardShow = () => {
    return (
        <ShowBase>
            <Stack flexDirection="column" gap={2} m={3} maxWidth="500px">
                <Stack flexDirection="column" gap={2}>
                    <CardAvatar size={200} />

                    <Stack flexDirection="column" gap={2} sx={{ width: '100%' }}>
                        <TextField source="another_name" color="textSecondary" />
                        <Labeled>
                            <CardRankField label="Ранг" />
                        </Labeled>
                        <Labeled>
                            <TextField source="description" label="Описание" />
                        </Labeled>
                    </Stack>
                </Stack>
                <Stack gap={2} flexDirection="column" alignItems="start" fullWidth>
                    <Labeled>
                        <UserInfoField source="author" label="Автор" clickable />
                    </Labeled>
                    <Labeled>
                        <TitleInfoField source="title" label="Тайтл" clickable />
                    </Labeled>
                </Stack>
                <LinkComp />
                <CardActions />
            </Stack>
        </ShowBase>
    );
};
