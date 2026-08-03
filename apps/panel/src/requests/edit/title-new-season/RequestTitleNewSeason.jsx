import { DateField,Labeled } from 'react-admin';

import Typography from '@mui/material/Typography';

import TitleInfoField from '../../../titles/common/TitleInfoField';

export const RequestTitleNewSeason = () => {
    return (
        <>
            <div className={'w-full mb-4'}>
                <Typography variant="h5" gutterBottom>
                    Сброс дат нового сезона
                </Typography>
                <TitleInfoField clickable source="title" />
                <Labeled>
                    <DateField source="title.new_season_date" label="Текущая дата сезона: " />
                </Labeled>

                <Labeled>
                    <DateField source="title.last_chapter_uploaded" label="Дата загрузки последней главы: " />
                </Labeled>
            </div>
            {/*<Labeled>*/}
            {/*    <TextField source="user_message" label="Комментарий пользователя: " variant="body1" sx={{ mb: 2 }} />*/}
            {/*</Labeled>*/}
        </>
    );
};
