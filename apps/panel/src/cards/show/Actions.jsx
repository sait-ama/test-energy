import { useNotify, useRecordContext } from 'react-admin';

import { Button, Stack } from '@mui/material';

import { deleteCard, notifyDeleteCard } from '../../dataProvider/custom/cards.js';

/**
 * Внутри SHOW
 * */
export const CardActions = () => {
    const notify = useNotify();
    const { id } = useRecordContext() ?? {};
    const handleNotifyDelete = async () => {
        try {
            await notifyDeleteCard(id);
            notify('Уведомление на удаление отправлено', { type: 'info' });
        } catch {
            notify('Ошибка при отправке уведомления', { type: 'warning' });
        }
    };

    const handleDelete = async () => {
        try {
            await deleteCard({ id });
            notify('Карточка удалена', { type: 'info' });
            // Можно добавить редирект или обновление списка
        } catch {
            notify('Ошибка при удалении карточки', { type: 'warning' });
        }
    };
    return (
        <Stack gap={2} flexDirection="row" justifyContent="space-between">
            <Button onClick={handleDelete}>Удалить</Button>
            <Button onClick={handleNotifyDelete}>Отправить увед на удаление</Button>
        </Stack>
    );
};
