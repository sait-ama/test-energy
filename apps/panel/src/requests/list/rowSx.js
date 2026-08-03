import orange from '@mui/material/colors/orange';
import red from '@mui/material/colors/red';

const rowSx = (record) => {
    let style = {};

    if (!record) {
        return style;
    }

    if (record.status === '1_open')
        style = {
            ...style,
            borderLeftColor: orange[500],
            borderLeftWidth: 5,
            borderLeftStyle: 'solid',
        };

    if (record.status === '2_accepted')
        style = {
            ...style,
            borderLeftColor: '#419d6f',
            borderLeftWidth: 5,
            borderLeftStyle: 'solid',
        };

    if (record.status === '3_rejected')
        style = {
            ...style,
            borderLeftColor: red[500],
            borderLeftWidth: 5,
            borderLeftStyle: 'solid',
        };

    if (record.meta?.is_announcement || record.meta?.rank === 'rank_a') {
        style = {
            ...style,
            borderRight: red[500],
            borderRightWidth: 5,
            borderRightStyle: 'solid',
        };
    }

    return style;
};

export default rowSx;
