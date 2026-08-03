import { useCallback } from 'react';
import {
    BooleanField,
    DateField,
    NumberField,
    ReferenceField,
    Show,
    Tab,
    TabbedShowLayout,
    TextField,
} from 'react-admin';

import { Box } from '@mui/material';

import { LinkUpdater } from '../../common/components/LinkUpdater';

const ChapterLinkUpdater = () => {
    const linksUpdateSelector = useCallback(
        (record) => (state) => ({
            ...state,
            link: `/chapter/${record?.id}`,
            adminLink: `/admin/chapters/chapter/${record?.id}`,
        }),
        [],
    );

    return <LinkUpdater selector={linksUpdateSelector} />;
};

const ChapterShow = () => {
    return (
        <Show>
            <ChapterLinkUpdater />
            <Box display="flex" flexDirection="column" gap={2} m={3}>
                <Box display="flex" gap={2} alignItems="center">
                    <TextField source="name" variant="h5" />
                    <NumberField source="id" color="textSecondary" />
                </Box>

                <Box display="flex" gap={2}>
                    <TextField source="chapter" label="Глава" />
                    <NumberField source="tome" label="Том" />
                    <NumberField source="index" label="Индекс" />
                    <BooleanField source="is_published" label="Опубликовано" />
                    <BooleanField source="is_paid" label="Платная" />
                </Box>

                <Box display="flex" gap={2}>
                    <DateField source="upload_date" label="Загружено" />
                    <DateField source="update_date" label="Обновлено" />
                    <NumberField source="score" label="Рейтинг" />
                </Box>

                <ReferenceField source="title" reference="titles" label="Тайтл">
                    <TextField source="main_name" />
                </ReferenceField>
            </Box>

            <TabbedShowLayout sx={{ '& .RaTabbedShowLayout-content': { padding: 0 } }}>
                <Tab label="Общее">
                    <Box p={2}>
                        <TextField source="content" multiline fullWidth label="Содержание" />
                    </Box>
                </Tab>
            </TabbedShowLayout>
        </Show>
    );
};

export default ChapterShow;
