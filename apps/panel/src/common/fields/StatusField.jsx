import { useRecordContext } from 'react-admin';

import orange from '@mui/material/colors/orange';
import red from '@mui/material/colors/red';
import { makeStyles } from '@mui/styles';

import { statusToIconMap } from '../../feedbacks/utils.js';

export const useStyles = makeStyles({
    pending: {
        fontWeight: 900,
        color: orange[500],
    },
    pinned: {
        fontWeight: 900,
        color: 'rgba(59, 130, 246, 0.5)',
    },
    accepted: {
        fontWeight: 900,
        color: '#419d6f',
    },
    declined: {
        fontWeight: 900,
        color: red[500],
    },
});
statusToIconMap
export const StatusField = () => {
    const { status } = useRecordContext();
    const classes = useStyles();

    if (status === '1_open') return <span className={classes.pinned}>В работе</span>;

    if (status === '2_accepted') return <span className={classes.accepted}>Проверено</span>;

    if (status === '3_rejected') return <span className={classes.declined}>Отклонено</span>;

    return 'Не определено';
};
