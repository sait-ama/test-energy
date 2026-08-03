import {
    EditButton,
    FunctionField,
    Labeled,
    RichTextField,
    Show,
    SimpleShowLayout,
    Tab,
    TabbedShowLayout,
    TextField,
} from 'react-admin';

import { Box } from '@mui/material';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { CreatorTitles } from 'src/creators/components/CreatorTitles.jsx';

import { LinkUpdater } from '../../common/components/LinkUpdater';
import usePrivileges from '../../hooks/usePrivileges.js';
import CreatorAvatar from '../components/CreatorAvatar';

const linksUpdateSelector = (record) => (state) => ({
    ...state,
    link: `/creator/${record.id}`,
    adminLink: record.admin_link,
});

const CreatorShow = () => {
    const { isFetching } = usePrivileges();

    if (isFetching) return null;

    return (
        <Show actions={() => null}>
            <SimpleShowLayout>
                <LinkUpdater selector={linksUpdateSelector} />

                <Box
                    alignItems="start"
                    justifyContent="space-between"
                    px={1}
                    mt={1}
                    sx={{ display: 'flex', width: '100%' }}
                >
                    <Box display="flex" alignItems="center" gap={2}>
                        <CreatorAvatar size={64} />
                        <Box display="flex" flexDirection="column">
                            <TextField source="alt_name" variant="body2" color="textSecondary" />
                            <Box display="flex" gap={1} alignItems="center">
                                <TextField source="name" variant="h5" />
                                <FunctionField render={({ id }) => `(ID: ${id})`} color="textSecondary" />
                            </Box>
                        </Box>
                    </Box>
                    <EditButton />
                </Box>
                <TabbedShowLayout sx={{ mt: 2 }}>
                    <Tab label="Общее">
                        <Labeled>
                            <RichTextField source="description" label="Описание: " />
                        </Labeled>

                        <Divider my={2}>
                            <Typography variant="h6">Тайтлы</Typography>
                        </Divider>
                        <CreatorTitles />
                    </Tab>
                </TabbedShowLayout>
            </SimpleShowLayout>
        </Show>
    );
};

export default CreatorShow;
