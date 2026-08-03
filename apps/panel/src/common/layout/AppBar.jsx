import { AppBar as RAAppbar } from 'react-admin';

import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
    title: {
        flex: 1,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
    spacer: {
        flex: 1,
    },
});

export const AppBar = (props) => {
    const classes = useStyles();
    // const isDesktop = useMediaQuery(
    //     theme => theme?.breakpoints.up('sm'),
    //         { noSsr: true }
    // );
    //
    // if(isDesktop) return null;
    //
    return (
        <RAAppbar
            sx={{
                '& .RaAppBar-title': {
                    flex: 1,
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    // color: '#ffffffb3',
                    // backgroundColor: '#1e1e1e',
                },
            }}
            color="secondary"
            elevation={1}
            userMenu={false}
            {...props}
        >
            <Typography variant="h6" color="inherit" id="react-admin-title" className={classes.title} />
            <span className={classes.spacer} />
        </RAAppbar>
    );
};
