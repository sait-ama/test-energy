import { Link, RichTextField, ShowBase, TextField } from 'react-admin';

import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton, Stack } from '@mui/material';
import CharacterAvatar from 'src/characters/components/CharacterAvatar.jsx';
import TitleInfoField from 'src/titles/common/TitleInfoField.jsx';

export const CharacterShow = ({ id, onClose }) => {
    return (
        <ShowBase id={id}>
            <Box pt={8} px={2} width={{ xs: '100vW', sm: 400 }} mt={{ xs: 2, sm: 1 }}>
                <Stack direction="row" mb={1}>
                    <TextField source="name" variant="h6" flex="1" />
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Stack>
                <Stack direction="column" mb={1} gap={1}>
                    <CharacterAvatar size={108} />
                    <TitleInfoField source="title" clickable />
                    <RichTextField source="description" />
                    <Link to={`${import.meta.env.VITE_URL}/character/${id}`} target="_blank">
                        Ссылка на ремангу
                    </Link>
                </Stack>
            </Box>
        </ShowBase>
    );
};
