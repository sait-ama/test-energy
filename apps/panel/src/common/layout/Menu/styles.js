import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles({
    link: {
        paddingTop: '2px',
        paddingBottom: '2px',
        paddingRight: '10px',
        minWidth: '40px',
        minHeight: '48px',
        display: 'flex',
        color: 'gray',
        gap: '8px',
        '&:hover .MuiSvgIcon-root': {
            color: 'white',
        },
    },
});
