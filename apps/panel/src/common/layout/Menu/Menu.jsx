import { Menu } from 'react-admin';

import { Feedback } from '@mui/icons-material';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import BookIcon from '@mui/icons-material/Book';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import GroupIcon from '@mui/icons-material/Group';
import QueueIcon from '@mui/icons-material/Queue';
import RateReviewIcon from '@mui/icons-material/RateReview';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import SubdirectoryArrowLeftRoundedIcon from '@mui/icons-material/SubdirectoryArrowLeftRounded';
import Divider from '@mui/material/Divider';

import { useCountRequests } from '../../../hooks/useUncheckedRequests.js';

import { StatItem } from './menu-item/StatItem';
import { MenuBottomContent } from './MenuBottomContent';
import { MenuItemLink, MenuItemLinkUncheckedRequests } from './MenuItemLink';

export const MenuWithLinks = (props) => {
    const { data: counts } = useCountRequests();

    return (
        <Menu {...props} sx={{ gap: 0.5 }}>
            {counts.show_reports ? (
                <MenuItemLinkUncheckedRequests resource="reports" label="Репорты" icon={ErrorRoundedIcon} />
            ) : null}

            {counts.show_requests ? (
                <MenuItemLinkUncheckedRequests resource="requests" label="Запросы" icon={RateReviewIcon} />
            ) : null}

            {counts.show_calls ? (
                <MenuItemLinkUncheckedRequests resource="moderator-requests" label="Зовы" icon={RecordVoiceOverIcon} />
            ) : null}
            {counts.show_feedbacks ? (
                <MenuItemLinkUncheckedRequests resource="feedbacks" label="Фидбэки" icon={Feedback} />
            ) : null}
            {counts.show_add_guild_pack ? (
                <MenuItemLinkUncheckedRequests
                    resource="items-requests"
                    countField="add_guild_pack"
                    label="Заявки на паки"
                    icon={Feedback}
                />
            ) : null}
            <StatItem />
            <Divider />
            {counts.can_manage_queue ? (
                <>
                    <MenuItemLink to="/queue-config" label="Очереди" icon={QueueIcon} />
                    <Divider />
                </>
            ) : null}
            <MenuItemLink to="/users" label="Пользователи" icon={GroupIcon} />
            <MenuItemLink to="/publishers" label="Паблишеры" icon={AssignmentIndIcon} />
            <MenuItemLink to="/titles" label="Тайтлы" icon={BookIcon} />
            <MenuItemLink to="/chapters" label="Главы" icon={BookIcon} />
            <MenuItemLink to="/creators" label="Создатели" icon={BookIcon} />
            <MenuItemLink to="/cards" label="Карточки" icon={BookIcon} />
            <MenuItemLink to="/characters" label="Персонажи" icon={BookIcon} />
            <MenuItemLink to="/comments" label="Комментарии" icon={BookIcon} />
            <MenuItemLink to="/branches" label="Ветки" icon={BookIcon} />
            <MenuItemLink to="/notifications" label="Уведомления" icon={BookIcon} />

            <MenuBottomContent />

            <MenuItemLink
                to={import.meta.env.VITE_URL}
                label="На ремангу"
                color="text.secondary"
                leftIcon={<SubdirectoryArrowLeftRoundedIcon />}
            />
        </Menu>
    );
};
