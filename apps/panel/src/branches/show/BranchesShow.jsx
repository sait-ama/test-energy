import {
    ArrayField,
    DateField,
    DateInput,
    // WithRecord,
    Edit,
    NumberField,
    SaveButton,
    Show,
    SimpleForm,
    SimpleShowLayout,
} from 'react-admin';

import { Button } from '@mui/material';
import { Dialog } from 'src/common/components/Dialog';

import { PublisherDatagrid } from '../../publishers/list/PublisherDatagrid.jsx';
import TitleInfoField from '../../titles/common/TitleInfoField';

const validateImmuneDate = (value) => {
    // Если поле пустое - это допустимо, так как поле необязательное
    if (!value) {
        return undefined;
    }
    
    // Получаем текущую дату и устанавливаем время на 00:00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Получаем завтрашнюю дату
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Проверяем, что выбранная дата >= завтрашней
    const selectedDate = new Date(value);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < tomorrow) {
        return 'Дата иммунитета должна быть начиная с завтрашнего дня';
    }
    
    return undefined; // Валидация успешна
};

const ImmuneDateEditButton = () => {
    // const record = useRecordContext();

    return (
        <Dialog
            openModalComponent={(onOpen) => (
                <Button onClick={onOpen} size="small" variant="outlined">
                    Обновить иммунитет
                </Button>
            )}
            renderContent={(onClose) => (
                <Edit
                    sx={{ '& .RaEdit-main': { m: '0 !important' } }}
                    actions={false}
                    resource="branches"
                    mutationOptions={{ onSuccess: onClose }}
                    transform={(data) => ({
                        immune_date: data.immune_date,
                        title: data.title.id,
                    })}
                    mutationMode="pessimistic"
                >
                    <SimpleForm toolbar={false}>
                        <DateInput validate={validateImmuneDate} source="immune_date" label="Иммунитет до" />
                        <SaveButton />
                    </SimpleForm>
                </Edit>
            )}
        />
    );
};
export const BranchesShow = () => {
    return (
        <Show>
            <SimpleShowLayout>
                <NumberField source="id" />
                <DateField source="immune_date" label="Иммунитет до" />

                <ImmuneDateEditButton />
                <NumberField source="count_chapters" label="Количество глав" />
                <TitleInfoField source="title" clickable />
                <ArrayField source="publishers">
                    <PublisherDatagrid />
                </ArrayField>
            </SimpleShowLayout>
        </Show>
    );
};
