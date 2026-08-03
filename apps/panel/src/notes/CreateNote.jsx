import { useState } from 'react';
import { useCreate, useGetIdentity, useListContext, useNotify, useResourceContext } from 'react-admin';

import { Box, Button, TextField as TextInput } from '@mui/material';

export const CreateNote = ({ reference, target }) => {
    const resource = useResourceContext();
    const { refetch } = useListContext();
    const [message, setMessage] = useState('');

    const [create, { isLoading }] = useCreate();
    const notify = useNotify();
    const { identity } = useGetIdentity();

    if (!identity) return null;

    const handleSubmit = (event) => {
        event.preventDefault();

        const data = {
            target,
            target_type: reference,
            // date,
            message,
        };

        create(
            resource,
            { data },
            {
                onSuccess: () => {
                    setMessage('');
                    notify('Note added successfully');
                    refetch();
                    // update(reference, {
                    //     id: record?.id,
                    //     data: {
                    //         last_seen: date,
                    //         nb_notes: record.nb_notes + 1,
                    //     },
                    //     previousData: record,
                    // });
                },
            },
        );
        return false;
    };
    return (
        <Box mt={0} width="100%">
            <div>
                <TextInput
                    label="Текст заметки"
                    variant="outlined"
                    size="small"
                    fullWidth
                    multiline
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    rows={2}
                />
                <Box display="flex" mb={2} justifyContent="space-between" mt={1}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={!message || isLoading}
                        sx={{ p: 1, fontSize: 12 }}
                        onClick={handleSubmit}
                    >
                        Отправить
                    </Button>
                </Box>
            </div>
        </Box>
    );
};
