import { Close } from '@mui/icons-material';
import { Button } from '@mui/material';
import MADialog from '@mui/material/Dialog';

import { useOpen } from '../../hooks/useOpen.js';

export const Dialog = (props) => {
    const { openModalComponent, renderContent, showCloseIcon = true, onClose, ...rest } = props;

    const [open, toggle, setOpen] = useOpen(false);

    const onCloseDialog = () => {
        onClose?.();
        setOpen(false);
    };

    return (
        <>
            {openModalComponent(toggle)}
            <MADialog fullScreen={false} scroll="paper" {...rest} open={open} onClose={onCloseDialog} fullWidth>
                <div
                    style={{
                        display: showCloseIcon ? 'block' : 'none',
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        zIndex: 999,
                        borderRadius: 20,
                    }}
                >
                    <Button
                        onClick={toggle}
                        size="small"
                        color="inherit"
                        style={{ borderRadius: 20, background: 'none' }}
                    >
                        <Close />
                    </Button>
                </div>
                {renderContent(onCloseDialog)}
            </MADialog>
        </>
    );
};
