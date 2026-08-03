import { useState } from 'react';
import { Edit, RadioButtonGroupInput, SaveButton, SimpleForm, TextInput, Toolbar, useRefresh } from 'react-admin';

import { Button, Card, CardActions, CardContent, Chip, Dialog, Typography } from '@mui/material';

const QueueConfigEditToolbar = ({ onClose }) => (
    <Toolbar>
        <SaveButton mutationOptions={{ onSuccess: onClose }} />
        <Button onClick={onClose} sx={{ ml: 2 }}>
            Отмена
        </Button>
    </Toolbar>
);

export const QueueConfigCard = ({ model, label, disabled }) => {
    const [open, setOpen] = useState(false);
    const refresh = useRefresh();

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        refresh();
    };

    if (!model) return null;

    const isOpened = model.status === 'opened';

    return (
        <>
            <Card
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 150,
                    backgroundColor: 'transparent',
                }}
            >
                <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div" gutterBottom sx={{ fontSize: '0.95rem' }}>
                        {label}
                    </Typography>
                    {model.closing_comment && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.85rem' }}>
                            Комментарий:{' '}
                            {model.closing_comment.length > 60
                                ? `${model.closing_comment.substring(0, 60)}...`
                                : model.closing_comment}
                        </Typography>
                    )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between' }}>
                    <Chip
                        label={isOpened ? 'Открыта' : 'Закрыта'}
                        color={isOpened ? 'success' : 'error'}
                        variant="outlined"
                        size="small"
                    />
                    <Button size="small" onClick={handleOpen} disabled={disabled}>
                        Изменить
                    </Button>
                </CardActions>
            </Card>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <Edit
                    resource="queue-config"
                    id={model.id}
                    mutationMode="pessimistic"
                    onSuccess={handleClose}
                    transform={(data) => ({
                        ...data,
                        type: model.type,
                    })}
                    redirect={false}
                    title={`Изменить статус очереди: ${label}`}
                    sx={{
                        bgcolor: 'background.paper',
                        '& .RaEdit-main': { mt: 0 },
                        '& .RaEdit-card': { boxShadow: 'none' },
                        '& .MuiToolbar-root': { bgcolor: 'background.paper' },
                    }}
                >
                    <SimpleForm
                        toolbar={<QueueConfigEditToolbar onClose={handleClose} />}
                        sx={{ bgcolor: 'background.paper' }}
                    >
                        <RadioButtonGroupInput
                            source="status"
                            label="Статус очереди"
                            choices={[
                                { id: 'opened', name: 'Открыта' },
                                { id: 'closed', name: 'Закрыта' },
                            ]}
                            defaultValue="opened"
                        />
                        <TextInput
                            source="closing_comment"
                            label="Комментарий при закрытии"
                            multiline
                            rows={3}
                            fullWidth
                            helperText="Опциональный комментарий, который будет отображаться при закрытой очереди"
                        />
                    </SimpleForm>
                </Edit>
            </Dialog>
        </>
    );
};
