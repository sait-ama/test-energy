import { useState } from 'react';
import { DateField, useDelete, useNotify, useResourceContext, useUpdate } from 'react-admin';

import TrashIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Button, IconButton, OutlinedInput, Typography } from '@mui/material';

import { ModalSubmit } from '../common/components/ConfirmAction.jsx';
import { useOpen } from '../hooks/useOpen.js';

export const Note = (props) => {
    const { note } = props;

    const [isHover, setHover] = useState(false);
    const [isEditing, setEditing] = useState(false);
    const [noteText, setNoteText] = useState(note.message);
    const resource = useResourceContext();
    // const record = useRecordContext();
    const notify = useNotify();

    const [update, { isLoading }] = useUpdate();
    const [shouldConfirm, handleConfirmDeletion] = useOpen();

    const [deleteNote] = useDelete(
        resource,
        { id: note.id, previousData: note },
        {
            mutationMode: 'undoable',
            onSuccess: () => {
                notify('Note deleted', { type: 'info', undoable: true });
            },
        },
    );

    const handleEnterEditMode = () => {
        setEditing(true);
    };

    const handleCancelEdit = () => {
        setEditing(false);
        setNoteText(note.message);
        setHover(false);
    };

    const handleTextChange = (event) => {
        setNoteText(event.target.value);
    };

    const handleNoteUpdate = (event) => {
        event.preventDefault();
        update(
            resource,
            {
                id: note.id,
                data: { message: noteText, important: false, is_patch: true },
                previousData: note,
            },
            {
                onSuccess: () => {
                    setEditing(false);
                    setNoteText(note.message);
                    setHover(false);
                },
                onError: (error) => {
                    console.log(error);
                },
            },
        );
    };

    const disabled = isLoading || !noteText;

    return (
        <Box mb={2} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <Box mb={1} px={1} color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography component="span" variant="body2">
                    <b>{note.owner?.username}</b>{' '}
                </Typography>
                <DateField sx={{ ml: 'auto' }} source="created_at" record={note} variant="caption" showTime />
            </Box>
            {isEditing ? (
                <form onSubmit={handleNoteUpdate}>
                    <OutlinedInput
                        value={noteText}
                        onChange={handleTextChange}
                        fullWidth
                        multiline
                        sx={{
                            lineHeight: 1.3,
                        }}
                        autoFocus
                    />
                    <Box display="flex" justifyContent="flex-end" mt={1}>
                        <Button
                            sx={{ mr: 1, p: 1, fontSize: 12 }}
                            size="small"
                            onClick={handleCancelEdit}
                            color="primary"
                        >
                            Отмена
                        </Button>
                        <Button
                            sx={{ p: 1, fontSize: 12 }}
                            size="small"
                            type="submit"
                            color="primary"
                            variant="contained"
                            disabled={disabled}
                        >
                            Сохранить
                        </Button>
                    </Box>
                </form>
            ) : (
                <Box
                    sx={{
                        bgcolor: 'rgba(255,255,255,0.1)',
                        padding: '0px 12px 0px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'stretch',
                        marginBottom: 1,
                        position: 'relative',
                    }}
                >
                    <Box
                        component="p"
                        fontFamily="fontFamily"
                        fontSize="body2.fontSize"
                        lineHeight={1.3}
                        my={1}
                        sx={{ wordBreak: 'break-all' }}
                    >
                        {note.message}
                    </Box>
                    <Box
                        sx={{
                            mt: 0.5,
                            mr: 0.5,
                            marginLeft: 1,
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            // justifyContent: 'space-around',
                            visibility: isHover ? 'visible' : 'hidden',
                            position: 'absolute',
                            right: 0,
                            top: 0,
                        }}
                    >
                        <IconButton size="small" onClick={handleEnterEditMode}>
                            <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton size="small" onClick={handleConfirmDeletion}>
                            <TrashIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Box>
                </Box>
            )}
            <ModalSubmit open={shouldConfirm} onSubmit={deleteNote} />
        </Box>
    );
};
