import {
    FunctionField,
    NumberField,
    Show,
    SimpleShowLayout,
    Tab,
    TabbedShowLayout,
    TextField,
    useRecordContext,
} from 'react-admin';

import { Box, Button } from '@mui/material';
import PublisherTypeField from 'src/publishers/components/PublisherTypeField';

import { Dialog } from '../../common/components/Dialog.jsx';
import { LinkUpdater } from '../../common/components/LinkUpdater';
import PublisherAvatar from '../components/PublisherAvatar';

import { PublisherAbout } from './about/PublisherAbout';
import { PublisherInvitations } from './invitations/PublisherInvitations';
import { PublisherStrikes } from './strikes/PublisherStrikes';
import { PublisherTitles } from './titles/PublisherTitles';
import { GivePromoDays } from './PublisherAddPromoDays.jsx';
import Aside from './PublisherAside';

const linksUpdateSelector = (record) => (state) => ({
    ...state,
    link: `/team/${record?.dir}`,
    adminLink: record?.admin_link,
});

const PublisherShow = () => {
    const record = useRecordContext();

    if (!record) return null;

    return (
        <>
            <LinkUpdater selector={linksUpdateSelector} />

            <Box display="flex" gap={3} px={2} alignItems="center" justifyContent="space-between">
                <Box m={3} gap={1} display="flex" flexDirection="column">
                    <PublisherTypeField variant="body2" color="text.secondary" />
                    <Box display="flex" gap={3} mb={0} alignItems="center">
                        <PublisherAvatar size={80} />
                        <Box display="flex" flexDirection="column">
                            <Box display="flex" gap={1} alignItems="center">
                                <TextField source="name" variant="h5" />
                                <FunctionField render={({ id }) => `(ID: ${id})`} color="textSecondary" />
                            </Box>
                            <SimpleShowLayout
                                sx={{
                                    // mx: 2,
                                    p: 0,
                                    pt: 0.5,
                                    display: 'flex',
                                    width: '100%',
                                    '& .RaSimpleShowLayout-stack': {
                                        alignItems: 'center',
                                        flexDirection: 'row',
                                        gap: 3,
                                        '& .MuiStack-root': {
                                            marginBottom: 0,
                                            marginTop: 0,
                                        },
                                    },
                                }}
                            >
                                <NumberField source="count_titles" label="Тайтлов" />
                                <NumberField source="count_votes" label="Лайков" />
                                <NumberField source="count_period_chapters" label="глав/мес" />
                                <NumberField source="count_strikes" label="Страйков" />
                            </SimpleShowLayout>
                        </Box>
                    </Box>
                </Box>
                <Dialog
                    openModalComponent={(onOpen) => (
                        <Button variant="contained" onClick={onOpen} size="small">
                            Выдать дни
                        </Button>
                    )}
                    renderContent={(onClose) => <GivePromoDays onSuccess={onClose} />}
                />
            </Box>

            <TabbedShowLayout sx={{ '& .RaTabbedShowLayout-content': { padding: 0 } }}>
                <Tab label="Общее">
                    <PublisherAbout />
                </Tab>

                <Tab label="Тайтлы">
                    <PublisherTitles />
                </Tab>

                <Tab label="Страйки">
                    <PublisherStrikes />
                </Tab>

                <Tab label="Инвайты">
                    <PublisherInvitations />
                </Tab>
            </TabbedShowLayout>
        </>
    );
};

const PublisherShowRoot = () => {
    return (
        <Show aside={<Aside />}>
            <PublisherShow />
        </Show>
    );
};

export default PublisherShowRoot;
