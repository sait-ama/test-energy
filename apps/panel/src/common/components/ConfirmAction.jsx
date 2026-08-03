import { Button, Dialog, Typography } from '@mui/material';

export const ModalSubmit = (props) => {
    const { onClose, onSubmit, onReject, label = null, open, ...other } = props;

    const handleCancel = () => {
        if (onReject) onReject();
        onClose();
    };

    const handleOk = () => {
        if (onSubmit) onSubmit();
        onClose();
    };

    return (
        <Dialog maxWidth="xs" aria-labelledby="confirmation-dialog-title" open={open} {...other}>
            <div className="p-6">
                <Typography variant="h5" className="mb-2">
                    Подтвердите действие
                </Typography>
                {label ? <Typography variant="body2">{label}</Typography> : null}

                <div className="flex space-x-2 mt-4">
                    <Button autoFocus onClick={handleCancel} color="primary">
                        Назад
                    </Button>
                    <Button onClick={handleOk} color="primary">
                        Подтвердить
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};
