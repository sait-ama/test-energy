import { useCallback } from 'react';
import { List, SearchInput } from 'react-admin';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';

import { Box, Drawer } from '@mui/material';
import CommentShow from 'src/comments/CommentShow.jsx';
import { Pagination } from 'src/common/components/Paginations.jsx';

import { CommentsDatagrid } from './components/CommentsDatagrid.jsx';

const rowStyle = (selectedRow) => (record) => {
    let style = {};
    if (!record) {
        return style;
    }
    if (selectedRow && selectedRow === record.id) {
        style = {
            ...style,
            backgroundColor: 'action.selected',
        };
    }
    return style;
};

const CommentsList = () => {
    // const isXSmall = useMediaQuery(theme =>
    //         theme.breakpoints.down('sm')
    // );
    const location = useLocation();
    const navigate = useNavigate();

    const handleClose = useCallback(() => {
        navigate('/comments');
    }, [navigate]);

    const match = matchPath('/comments/:id', location.pathname);

    return (
        <Box display="flex" flexDirection="row" gap={2}>
            <List
                filters={[<SearchInput source="search" alwaysOn name="search" autoComplete="false" />]}
                perPage={20}
                exporter={false}
                actions={null}
                pagination={<Pagination />}
                sx={{
                    flexGrow: 1,
                    transition: (theme) =>
                        theme.transitions.create(['all'], {
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                    marginRight: match ? '400px' : 0,
                }}
            >
                <CommentsDatagrid rowClick="edit" rowSx={rowStyle(parseInt(match?.params.id, 10))} />
            </List>
            <Drawer variant="persistent" open={!!match} anchor="right" onClose={handleClose} sx={{ zIndex: 100 }}>
                {match && <CommentShow id={match.params.id} onClose={handleClose} />}
            </Drawer>
        </Box>
    );
};

export default CommentsList;
