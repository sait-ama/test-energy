import { useCallback } from 'react';
import { List, NumberField, SearchInput } from 'react-admin';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';

import { Box, Drawer } from '@mui/material';
import CharacterInfoField from 'src/characters/components/CharacterInfoField.jsx';
import { CharacterShow } from 'src/characters/show/CharacterShow.jsx';
import { Pagination } from 'src/common/components/Paginations';
import TitleInfoField from 'src/titles/common/TitleInfoField.jsx';

import { CustomDatagrid } from '../../common/components/CustomDatagrid.jsx';

const rowSx = (selectedRow) => (record) => {
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

export const CharactersList = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleClose = useCallback(() => {
        navigate('/characters');
    }, [navigate]);

    const match = matchPath('/characters/:id', location.pathname);

    return (
        <Box display="flex" flexDirection="row" gap={2}>
            <List
                filters={[<SearchInput source="search" alwaysOn name="search" autoComplete="false" />]}
                perPage={20}
                exporter={false}
                actions={null}
                style={{ width: '100%' }}
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
                <CustomDatagrid
                    optimized
                    rowClick="edit"
                    bulkActionButtons={false}
                    rowSx={rowSx(parseInt(match?.params.id, 10))}
                >
                    <CharacterInfoField label="Персонаж" />
                    <TitleInfoField source="title" label="Тайтл" />
                    <NumberField source="id" />
                </CustomDatagrid>
            </List>
            <Drawer variant="persistent" open={!!match} anchor="right" onClose={handleClose} sx={{ zIndex: 100 }}>
                {match && <CharacterShow id={match.params.id} onClose={handleClose} />}
            </Drawer>
        </Box>
    );
};
