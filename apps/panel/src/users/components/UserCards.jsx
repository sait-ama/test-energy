import {
    BooleanField,
    Create,
    DateField,
    DeleteButton,
    FilterList,
    FilterListItem,
    List,
    NumberField,
    NumberInput,
    ReferenceField,
    ReferenceManyField,
    SimpleForm,
    useRecordContext,
} from 'react-admin';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CardInfoField from 'src/cards/components/CardInfoField.jsx';
import { CustomDatagrid } from 'src/common/components/CustomDatagrid.jsx';
import { Dialog } from 'src/common/components/Dialog';
import { CustomTextInput } from 'src/common/fields/TextInput.jsx';

import { Pagination } from '../../common/components/Paginations.jsx';

const ranks = [
    { id: 'rank_re', name: 'RE Ранг' },
    { id: 'rank_s', name: 'S Ранг' },
    { id: 'rank_a', name: 'A Ранг' },
    { id: 'rank_b', name: 'B Ранг' },
    { id: 'rank_c', name: 'C Ранг' },
    { id: 'rank_d', name: 'D Ранг' },
    { id: 'rank_e', name: 'E Ранг' },
    { id: 'rank_f', name: 'F Ранг' },
];

const CreateCardModal = ({ userId }) => {
    return (
        <>
            <Dialog
                openModalComponent={(toggle) => (
                    <Button onClick={toggle} color="primary">
                        Выдать карту
                    </Button>
                )}
                renderContent={(onClose) => (
                    <Create resource="inventory-cards" redirect={false} mutationOptions={{ onSuccess: onClose }}>
                        <SimpleForm defaultValues={{ user_id: userId }}>
                            <NumberInput source="card_id" label="ID карты" />
                            <NumberInput source="stack_count" label="Количество" />
                            <CustomTextInput source="reason" label="Причина выдачи (опционально)" />
                        </SimpleForm>
                    </Create>
                )}
            />
        </>
    );
};

export const UserCards = () => {
    const record = useRecordContext();

    if (!record) return null;

    return (
        <ReferenceManyField target="user_id" source="id" label="Карты пользователя" reference="inventory-cards">
            <List
                exporter={false}
                pagination={<Pagination />}
                filter={{ user_id: record.id }}
                sort={{ field: 'id', order: 'DESC' }}
                aside={
                    <Box sx={{ display: 'flex', flexDirection: 'column', p: 1 }}>
                        <CreateCardModal userId={record.id} />
                        <FilterList icon={null} label="Ранг">
                            {ranks.map((rank) => (
                                <FilterListItem key={rank.id} label={rank.name} value={{ rank: rank.id }} />
                            ))}
                        </FilterList>
                    </Box>
                }
            >
                <CustomDatagrid>
                    <ReferenceField source="card" reference="cards">
                        <CardInfoField />
                    </ReferenceField>
                    <NumberField source="stack_count" />

                    <BooleanField source="is_favorite" />
                    <BooleanField source="is_exchangeable" />
                    <NumberField source="index" />
                    <DateField source="created_at" />
                    <DateField source="updated_at" />
                    <NumberField source="id" />
                    <DeleteButton mutationMode="optimistic" redirect={false} />
                </CustomDatagrid>
            </List>
        </ReferenceManyField>
    );
};
