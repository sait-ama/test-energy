import React from 'react';
import {
    DateField,
    Form,
    FunctionField,
    ReferenceField,
    ReferenceManyField,
    required,
    TextField,
    TextInput,
    useDelete,
    useRecordContext,
} from 'react-admin';

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import { CustomDatagrid } from 'src/common/components/CustomDatagrid';
import { Dialog as CustomDialog } from 'src/common/components/Dialog';

import { useOpen } from '../../hooks/useOpen.js';

import { BanCreate, banTypeChoices } from './BanCreate';
import UserInfoField from './UserInfoField';

const banId2Name = banTypeChoices.reduce((acc, it) => {
    acc[it.id] = it.name;
    return acc;
}, {});

const UnbanButton = () => {
    const [open, toggle, close] = useOpen();
    const recordContext = useRecordContext();

    const [deleteBan] = useDelete('bans', { id: recordContext.id, previousData: recordContext });

    const handleSubmit = async (data) => {
        await deleteBan('bans', { meta: { unban_reason: data.unban_reason } });
    };

    return (
        <>
            <Button onClick={toggle} color="error">
                Снять бан
            </Button>
            <Dialog open={open} maxWidth="md">
                <Form onSubmit={handleSubmit} className="p-4">
                    <DialogTitle>Укажите причину разбана</DialogTitle>
                    <DialogContent>
                        <Stack>
                            <TextInput
                                rows={3}
                                name="unban_reason"
                                source=""
                                validate={required()}
                                label="Причина разбана"
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={close} color="error">
                            Отмена
                        </Button>
                        <Button type="submit" color="primary">
                            Разбнить
                        </Button>
                    </DialogActions>
                </Form>
            </Dialog>
        </>
    );
};

const Bans = () => (
    <>
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'end',
                p: 2,
            }}
        >
            <CustomDialog
                openModalComponent={(onOpen) => (
                    <Button onClick={onOpen} size="small">
                        Выдать бан
                    </Button>
                )}
                renderContent={(onClose) => <BanCreate onSuccess={onClose} />}
            />
        </Box>
        <ReferenceManyField
            sort={{ field: 'id', order: 'DESC' }} // backend not working :(
            reference="bans"
            target="user_id"
        >
            <CustomDatagrid bulkActionButtons={false} rowStyle={(record) => ({ opacity: record.is_active ? 1 : 0.5 })}>
                <ReferenceField source="moderator" reference="users" target="id" label="Кем выдан">
                    <UserInfoField clickable sortable={false} secondaryField="id" />
                </ReferenceField>
                <TextField source="comment" sortable={false} label="Причина бана" />
                <FunctionField label="Тип бана" render={(record) => banId2Name[record.type]} />
                <DateField sortable={false} source="date" showTime label="Дата выдачи" />
                <DateField sortable={false} source="expires" showTime label="Дата окончания" />
                <FunctionField render={(record) => (record.is_active ? <UnbanButton /> : null)} />

                <FunctionField
                    label="Детали разбана"
                    render={(record) =>
                        !record.is_active ? (
                            <>
                                <TextField source="unban_reason" label="Причина разбана" sortable={false} />
                                <ReferenceField source="unbanned_by" reference="users" target="id" label="Кто разбанил">
                                    <UserInfoField clickable sortable={false} secondaryField="id" />
                                </ReferenceField>
                            </>
                        ) : null
                    }
                />
            </CustomDatagrid>
        </ReferenceManyField>
    </>
);

export default Bans;
