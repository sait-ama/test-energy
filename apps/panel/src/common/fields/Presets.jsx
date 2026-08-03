import { useEffect, useState } from 'react';
import { Form, TextInput } from 'react-admin';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useFormContext } from 'react-hook-form';

import { Add, CopyAll, Delete, Download } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Stack } from '@mui/material';
import Chip from '@mui/material/Chip';
import { isHotkey } from 'is-hotkey';

import { useOpen } from '../../hooks/useOpen';
import { ModalSubmit } from '../components/ConfirmAction';

export const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

export const Presets = ({ baseName, inputName = 'moderator_message' }) => {
    const name = `${baseName}Presets`;
    const [presets, setPresets] = useState(() => JSON.parse(localStorage.getItem(name) ?? '[]') ?? []);
    const [open, toggle, close] = useOpen();

    const [presetToDelete, setPresetToDelete] = useState(null);

    const handleDeletePreset = () => {
        const newPresets = presets.filter((item) => item.label !== presetToDelete.label);

        setPresets(newPresets);
        localStorage.setItem(name, JSON.stringify(newPresets));
    };

    const { setValue } = useFormContext();

    const onDragEnd = ({ destination, source }) => {
        if (!destination) return;

        const newItems = reorder(presets, source.index, destination.index);

        localStorage.setItem(`${baseName}Presets`, JSON.stringify(newItems));
        setPresets(newItems);
    };

    const handleSubmit = (values) => {
        const newPreset = { label: values.label, content: values.content };
        const newPresets = [...presets, newPreset];
        localStorage.setItem(`${baseName}Presets`, JSON.stringify(newPresets));
        setPresets(newPresets);
        close();
    };

    const handleChange = (value) => {
        setValue(inputName, value);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            for (let i = 1; i <= 9; i++) {
                if (!isHotkey(`alt+${i}`, e)) continue;
                if (presets.length < i - 1) continue;

                handleChange(presets[i - 1]?.content);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [presets]);

    return (
        <>
            <Grid container gap={1}>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="droppable-list" direction="horizontal">
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="flex gap-2 items-center flex-wrap"
                            >
                                {presets.map((preset, index) => (
                                    <Draggable key={preset.label} draggableId={preset.label} index={index}>
                                        {(provided) => (
                                            <Chip
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                label={
                                                    <div className="flex justify-center items-center gap-1 ">
                                                        {preset.label}
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setPresetToDelete(preset);
                                                            }}
                                                        >
                                                            <Delete color="error" />
                                                        </IconButton>
                                                    </div>
                                                }
                                                sx={{
                                                    '&:hover': {
                                                        cursor: 'pointer',
                                                    },
                                                }}
                                                onClick={() => handleChange(preset.content)}
                                            />
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>

                <IconButton size="small" onClick={toggle}>
                    <Add />
                </IconButton>
                <IconButton size="small" onClick={() => navigator.clipboard.writeText(JSON.stringify(presets))}>
                    <CopyAll />
                </IconButton>
                <IconButton
                    onClick={async () => {
                        const values = await navigator.clipboard.readText();
                        setPresets(JSON.parse(values));
                        localStorage.setItem(name, values);
                    }}
                >
                    <Download />
                </IconButton>
            </Grid>
            <ModalSubmit
                open={!!presetToDelete}
                onSubmit={handleDeletePreset}
                label={`Вы действительно хотите удалить пресет "${presetToDelete?.label}"?`}
                onClose={() => setPresetToDelete(null)}
            />
            <Dialog open={open} maxWidth="md">
                <Form onSubmit={handleSubmit} className="p-4">
                    <DialogTitle>Добавление пресета</DialogTitle>
                    <DialogContent>
                        <Stack>
                            <TextInput name="label" source="" label="Название" />
                            <TextInput name="content" source="" label="Содержание" multiline rows={5} fullWidth />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={close} color="error">
                            Отмена
                        </Button>
                        <Button type="submit" color="primary">
                            Добавить
                        </Button>
                    </DialogActions>
                </Form>
            </Dialog>
        </>
    );
};
