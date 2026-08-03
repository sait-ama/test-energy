import { List, Title, useListContext } from 'react-admin';

import { Box, Card, CardContent, CircularProgress, Grid2, Typography } from '@mui/material';

import { QueueConfigCard } from './QueueConfigCard';

const queueConfig = [
    { type: 'title_update', label: 'Изменение тайтла', disabled: true },
    { type: 'title_add', label: 'Добавление тайтла', disabled: true },
    { type: 'publisher_add', label: 'Добавление паблишера', disabled: true },
    { type: 'title_change_publisher', label: 'Изменение паблишеров тайтла', disabled: true },
    { type: 'title_new_season', label: 'Новый сезон тайтла', disabled: true },
    { type: 'title_chapter_update', label: 'Изменение главы', disabled: true },
    { type: 'title_add_creators', label: 'Добавление создателей к тайтлу', disabled: true },
    { type: 'creator_add', label: 'Добавление автора', disabled: true },
    { type: 'creator_update', label: 'Изменение автора', disabled: true },
    { type: 'creator_add_title', label: 'Добавление тайтла к автору', disabled: true },
    { type: 'title_additional_add', label: 'Добавление доп. инфо тайтла', disabled: true },
    { type: 'title_additional_update', label: 'Обновление ссылок тайтла', disabled: true },
    { type: 'character_add', label: 'Добавление персонажа', disabled: true },
    { type: 'character_update', label: 'Изменение персонажа', disabled: true },
    { type: 'title_relation_add', label: 'Добавление связи тайтлов', disabled: true },
    { type: 'title_relation_update', label: 'Обновление связей тайтлов', disabled: true },
    { type: 'card_item_add', label: 'Добавление карточки', disabled: false },
    { type: 'card_item_update', label: 'Изменение карточки', disabled: false },
    { type: 'shop_image_item_add', label: 'Добавление предметов магазина', disabled: true },
    { type: 'moment_add', label: 'Добавление момента', disabled: true },
    { type: 'moment_update', label: 'Обновление момента', disabled: true },
];

const queueConfigObj = queueConfig.reduce((acc, item) => {
    acc[item.type] = item;
    return acc;
}, {});

const QueueConfigListInner = () => {
    const { data, isLoading } = useListContext();

    if (isLoading) {
        return <CircularProgress />;
    }

    if (data.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary">
                Нет данных
            </Typography>
        );
    }

    return (
        <Grid2 container spacing={2} p={2}>
            {data.map((item) => (
                <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={item.type}>
                    <QueueConfigCard
                        disabled={queueConfigObj[item.type].disabled}
                        model={item}
                        label={queueConfigObj[item.type].label}
                    />
                </Grid2>
            ))}
        </Grid2>
    );
};
export const QueueConfigList = () => {
    return (
        <Box sx={{ mt: 3, mb: 3 }}>
            <Title title="Открытие/закрытие очереди" />
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h5" component="h2" gutterBottom>
                        Открытие/закрытие очереди
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Управление статусом очередей для заявок
                    </Typography>
                </CardContent>
            </Card>
            <List resource="queue-config" exporter={false} actions={null}>
                <QueueConfigListInner />
            </List>
        </Box>
    );
};

export default QueueConfigList;
