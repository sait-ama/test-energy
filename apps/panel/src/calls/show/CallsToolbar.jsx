import { FunctionField, Link, useRecordContext } from 'react-admin';

import { Button, Typography} from '@mui/material';
import { AcceptButton } from 'src/common/components/AcceptButton';

const type2Label = {
    1: 'Пользовательский зов',
    2: 'Карточный зов',
    3: 'Авторский зов',
    4: 'Переводчиский зов'
}

export const CallsToolbar = () => {
    const record = useRecordContext();

    return (
        <div className={'flex justify-center items-center mt-3 gap-2'}>
            <Typography variant="body2" color="text.secondary">
                {type2Label[record.type]}
            </Typography>
            <div className="flex-1"/>
            {record?.status?.id === 1 && (
                <AcceptButton
                    resource="moderator-requests"
                    record={record}
                    bodyParams={{ status: 2 }}
                    getLink={record.get_link}
                    buttonText="Начать диалог"
                    notifyTextFail="Произошла ошибка"
                    notifyTextSuccess="Тикет успешно отправлен"
                />
            )}
            <FunctionField
                render={(record) => (
                    <Button variant="outlined" component={Link} to={record.get_link} target="_blank">
                        Ссылка
                    </Button>
                )}
            />
            {record?.status?.id === 2 && (
                <AcceptButton
                    resource="moderator-requests"
                    record={record}
                    redirectTo="/moderator-requests"
                    bodyParams={{ status: 3 }}
                    buttonText="Закрыть тикет"
                    notifyTextFail="Произошла ошибка"
                    notifyTextSuccess="Тикет успешно отправлен"
                />
            )}
        </div>
    );
};
