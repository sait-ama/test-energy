import {
    ArrayField,
    DateField,
    ReferenceManyField,
    TextField,
    useGetIdentity,
    useRecordContext,
    WithListContext,
} from 'react-admin';

import { Add } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import Chip from '@mui/material/Chip';

import { CustomDatagrid } from '../../../common/components/CustomDatagrid.jsx';
import { Dialog } from '../../../common/components/Dialog';
import usePublisherTypes from '../../../hooks/usePublisherTypes';
import { StrikesAdd } from '../../../strikes/add/StrikesAdd';
import UserInfoField from '../../../users/components/UserInfoField';

import { DeleteStrike } from './DeleteStrike';

export const PublisherStrikes = () => {
    const { getNameById, isLoading } = usePublisherTypes();
    const record = useRecordContext();
    const user = useGetIdentity();

    if (isLoading) return null;

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'end',
                    p: 2,
                }}
            >
                <Dialog
                    openModalComponent={(onOpen) => (
                        <Button onClick={onOpen} startIcon={<Add />} size="small">
                            Добавить
                        </Button>
                    )}
                    renderContent={(onClose) => (
                        <StrikesAdd
                            onSuccess={onClose}
                            transform={(data) => ({
                                data: {
                                    ...data,
                                    moderator: user.identity.id,
                                    publisher: record.id,
                                },
                            })}
                        />
                    )}
                />
            </Box>

            <ReferenceManyField reference="strikes" target="publisher__id">
                <CustomDatagrid bulkActionButtons={false}
                                rowStyle={(record) => ({ opacity: record.is_active ? 1 : 0.5 })}>
                    <UserInfoField clickable sortable={false} source="given_by" secondaryField="id" label="Кем выдан" />
                    <TextField sortable={false} source="moderator_msg" label="Причина снятия" defaultValue="-" />
                    <UserInfoField
                        clickable
                        sortable={false}
                        source="removed_by"
                        secondaryField="id"
                        label="Кем снят"
                    />
                    <ArrayField sortable={false} source="restrictions" label="Ограничения">
                        <WithListContext
                            render={({ data }) => (
                                <ul className="flex gap-1 flex-wrap">
                                    {data.map((chip) => (
                                        <Chip key={chip} label={getNameById(chip, 'restrictions')} size="small" />
                                    ))}
                                </ul>
                            )}
                        />
                    </ArrayField>
                    <TextField sortable={false} source="reason" label="Причина" />

                    <DateField sortable={false} source="date" label="Дата выдачи" />
                    <DateField sortable={false} source="date_end" label="Дата окончания" />
                    <DeleteStrike />
                </CustomDatagrid>
            </ReferenceManyField>
        </>
    );
};
