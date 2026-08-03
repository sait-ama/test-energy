import { useContext, useEffect, useState } from 'react';

import LinkIcon from '@mui/icons-material/Link';
import Avatar from '@mui/material/Avatar';
import ListItemIcon from '@mui/material/ListItemIcon';
import cx from 'clsx';
import { MenuItemLink } from 'src/common/layout/Menu/MenuItemLink.jsx';

import { LinkContext } from '../context';

import { useStyles } from './styles.js';

const ListItemIconWithAvatar = ({ children, avatarClassName }) => {
    const classes = useStyles();

    return (
        <ListItemIcon className={classes.icon}>
            <Avatar className={cx(classes.avatar, avatarClassName)}>{children}</Avatar>
        </ListItemIcon>
    );
};

export const MenuBottomContent = (props) => {
    const { links } = useContext(LinkContext);
    const [state, setState] = useState({ ...links });

    useEffect(() => {
        setState({ ...links });
    }, [links]);
    const classes = useStyles();

    return (
        <div className={'mt-10'}>
            {state?.link && (
                <MenuItemLink
                    to={`${import.meta.env.VITE_URL}${links.link}`}
                    label="Ссылка"
                    color="text.secondary"
                    target="_blank"
                    leftIcon={<LinkIcon className={classes.font18} />}
                />
            )}
            {state?.adminLink && (
                <MenuItemLink
                    to={`${import.meta.env.VITE_URL}${links.adminLink}`}
                    label="Админка"
                    color="text.secondary"
                    target="_blank"
                    leftIcon={<ListItemIconWithAvatar>A</ListItemIconWithAvatar>}
                />
            )}
            {/*{state?.moderLink && (*/}
            {/*    <ListItemButton component="a" href={`${import.meta.env.VITE_URL}${links.moderLink}`} target="_blank">*/}
            {/*        <ListItemIconWithAvatar>A</ListItemIconWithAvatar>*/}
            {/*        <ListItemText primary="Модерка" />*/}
            {/*    </ListItemButton>*/}
            {/*)}*/}
        </div>
    );
};
