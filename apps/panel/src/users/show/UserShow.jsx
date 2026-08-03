import {
    BooleanField,
    DateField,
    FunctionField,
    Labeled,
    NumberField,
    Show,
    SimpleShowLayout,
    Tab,
    TabbedShowLayout,
    TextField,
} from 'react-admin';

import { Box, Button } from '@mui/material';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { Dialog } from 'src/common/components/Dialog';
import { UserPublishersList } from 'src/users/components/UserPublishers.jsx';

import { LinkUpdater } from '../../common/components/LinkUpdater';
import Bans from '../components/Bans';
import Comments from '../components/Comments';
import { GiveTickets } from '../components/GiveTickets';
import { Payments } from '../components/Payments';
import UserAvatar from '../components/UserAvatar';
import { UserBuys } from '../components/UserBuys';
import { UserCards } from '../components/UserCards';
import { UserCardUpgrades } from '../components/UserCardUpgrades';
import { UserNotifications } from '../components/UserNotifications.jsx';

import UserAside from './UserAside';

const linksUpdateSelector = (record) => (state) => ({
    ...state,
    link: `/user/${record.id}`,
    adminLink: record.admin_link,
});

const UserShow = () => {
    return (
        <Show aside={<UserAside />}>
            <SimpleShowLayout>
                <LinkUpdater selector={linksUpdateSelector} />
                <Box mx={1} mt={1}>
                    <Box display="flex" flexDirection="row" justifyContent="space-between">
                        {/*<FunctionField label="id" render={(record) => `Пользователь #${record.id}`} variant="h5" />*/}
                        {/*<FunctionField*/}
                        {/*    label="id"*/}
                        {/*    render={*/}
                        {/*        (record) => (*/}
                        {/*            <Box display="flex" flexDirection="row" gap={2} alignContent="center" justifyContent="center">*/}
                        {/*                {record.admin_link && (*/}
                        {/*                    <Typography variant="h6" target="_blank" lineHeight="43px" component="a" rel="noreferrer" href={record.admin_link}>*/}
                        {/*                        A*/}
                        {/*                    </Typography>*/}
                        {/*                )}*/}
                        {/*                <a target="_blank" rel="noreferrer" href={`${import.meta.env.URL}/user/${record.id}`}>*/}
                        {/*                    <LinkIcon />*/}
                        {/*                </a>*/}
                        {/*            </Box>*/}
                        {/*        )}*/}
                        {/*    variant="h4"*/}
                        {/*/>*/}
                    </Box>

                    <Box display="flex" gap={3} alignItems="center" justifyContent="space-between">
                        <Box display="flex" gap={3} alignItems="center">
                            <UserAvatar size={64} />
                            <Box display="flex" flexDirection="column" gap={0.5}>
                                <Box display="flex" gap={1} alignItems="center">
                                    <TextField source="username" variant="h5" fontWeight="bold" />
                                    <FunctionField render={({ id }) => `ID: ${id}`} color="textSecondary" />
                                </Box>

                                <Box display="flex" gap={2}>
                                    <FunctionField
                                        render={(record) => `${record.balance} руб.`}
                                        color="textSecondary"
                                    />
                                    <FunctionField
                                        render={(record) => `${record.ticket_balance} тик.`}
                                        color="textSecondary"
                                    />
                                    <Divider orientation="vertical" />
                                    <FunctionField
                                        render={(record) => `${record.count_comments} коммов`}
                                        color="textSecondary"
                                    />
                                    <FunctionField
                                        render={(record) => `${record.count_votes} лайков`}
                                        color="textSecondary"
                                    />
                                    <FunctionField
                                        render={(record) => `${record.count_views} п. глав`}
                                        color="textSecondary"
                                    />
                                </Box>
                            </Box>
                        </Box>

                        <Dialog
                            openModalComponent={(onOpen) => (
                                <Button variant="contained" onClick={onOpen} size="small">
                                    Выдать тикеты
                                </Button>
                            )}
                            renderContent={(onClose) => <GiveTickets onSuccess={onClose} />}
                        />
                    </Box>
                </Box>

                <TabbedShowLayout sx={{ mt: 2 }}>
                    <Tab label="Общее">
                        <Box display="flex" flexDirection="row" gap={4} mt={2}>
                            <Labeled>
                                <DateField source="date_joined" label="Дата регистрации: " />
                            </Labeled>
                            <Labeled>
                                <TextField source="email" label="Почта: " />
                            </Labeled>
                            <Labeled>
                                <DateField source="last_seen_date" label="Последний раз заходил: " />
                            </Labeled>
                            <Labeled>
                                <NumberField source="last_ip" label="Последний IP с которого заходил: " />
                            </Labeled>
                            <Labeled>
                                <DateField source="birthday" label="День рождения: " />
                            </Labeled>
                        </Box>

                        <Box display="flex" flexDirection="row" gap={4} mt={1}>
                            <Labeled>
                                <BooleanField source="is_active" label="Аккаунт активирован: " />
                            </Labeled>
                            <Labeled>
                                <BooleanField source="is_banned" label="Забанен: " />
                            </Labeled>
                        </Box>
                        <Divider my={2}> Соц-сети</Divider>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Labeled>
                                <NumberField source="vk_id" label="VK ID" />
                            </Labeled>
                            <Labeled>
                                <NumberField source="google_id" label="GOOGLE ID" />
                            </Labeled>
                            <Labeled>
                                <NumberField source="telegram_id" label="TELEGRAM ID" />
                            </Labeled>
                            <Labeled>
                                <NumberField source="yandex_id" label="YANDEX ID" />
                            </Labeled>
                            <Labeled>
                                <NumberField source="apple_id" label="APPLE ID" />
                            </Labeled>
                        </Box>

                        <Box display="flex" flexDirection="row" gap={4} mt={1}></Box>

                        <Divider my={2}>
                            <Typography variant="h6">В составе команд</Typography>
                        </Divider>

                        <UserPublishersList />
                    </Tab>

                    <Tab label="Комменты">
                        <Comments />
                    </Tab>
                    <Tab label="Баны">
                        <Bans />
                    </Tab>
                    {/*<Tab label="Тикеты">*/}
                    {/*    <>NOT DONE</>*/}
                    {/*</Tab>*/}
                    <Tab label="Биллинг">
                        <Payments />
                    </Tab>
                    <Tab label="Покупки">
                        <UserBuys />
                    </Tab>
                    <Tab label="Уведомления">
                        <UserNotifications />
                    </Tab>
                    <Tab label="Карты">
                        <UserCards />
                    </Tab>
                    <Tab label="История апгрейдов">
                        <UserCardUpgrades />
                    </Tab>
                </TabbedShowLayout>
            </SimpleShowLayout>
        </Show>
    );
};

export default UserShow;
