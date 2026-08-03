import { Create, required, SelectInput, SimpleForm, TextInput } from 'react-admin';

import { Card } from '@mui/material';

const notificationTypeChoices = [
    { id: 0, name: 'Обновления' },
    { id: 1, name: 'Социальное' },
    { id: 2, name: 'Важное' },
];

const transformUserIds = (value) => {
    if (!value) return [];
    return value.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
};

export default function NotificationsCreate() {
    return (
        <Create transform={(data) => ({
            ...data,
            user_ids: transformUserIds(data.user_ids)
        })}>
            <SimpleForm>
                <Card sx={{ p: 2 }}>
                    <TextInput 
                        source="user_ids"
                        label="ID пользователей (через запятую)"
                        helperText="Введите ID пользователей через запятую, например: 1,2,3,4"
                        validate={required()}
                        fullWidth
                    />
                    
                    <TextInput 
                        source="text"
                        label="Содержимое" 
                        multiline 
                        rows={4}
                        validate={required()}
                        fullWidth
                    />
                    
                    <TextInput 
                        source="link"
                        label="Ссылка" 
                        validate={required()}
                        fullWidth
                    />
                    
                    <SelectInput 
                        source="type"
                        label="Тип уведомления"
                        choices={notificationTypeChoices}
                        validate={required()}
                    />
                </Card>
            </SimpleForm>
        </Create>
    );
}