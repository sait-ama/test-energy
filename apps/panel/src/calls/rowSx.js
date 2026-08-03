import orange from '@mui/material/colors/orange';

const rowSx = (record) => {
    let style = {};

    if (record?.status.id === 1)
        // waiting
        return {
            ...style,
            borderLeftColor: orange[500],
            borderLeftWidth: 5,
            borderLeftStyle: 'solid',
        };
    if (record?.status.id === 2)
        //in progress
        return {
            ...style,
            borderLeftColor: 'rgba(59, 130, 246, 0.5)',
            borderLeftWidth: 5,
            borderLeftStyle: 'solid',
        };
    if (record?.status.id === 3)
        // closed
        return {
            ...style,
            borderLeftColor: '#6E6F74',
            borderLeftWidth: 5,
            borderLeftStyle: 'solid',
        };
    return style;
};

export default rowSx;
