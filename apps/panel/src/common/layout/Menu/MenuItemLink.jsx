import { MenuItemLink as RAMenuItemLink } from 'react-admin';

import { Chip } from '@mui/material';

import { useUncheckedRequests } from '../../../hooks/useUncheckedRequests.js';

export const MenuItemLink = (props) => {
    const { icon: Icon, badgeContent = 0, label, ...rest } = props;

    return (
        <RAMenuItemLink
            leftIcon={Icon ? <Icon /> : null}
            {...rest}
            // className={classes.link}
            primaryText={
                <>
                    {label}
                    {badgeContent ? (
                        <Chip color="primary" label={badgeContent} size="small" sx={{ marginLeft: 'auto' }} />
                    ) : (
                        ''
                    )}
                </>
            }
        />
    );
};

export const MenuItemLinkUncheckedRequests = ({ resource, countField = resource?.replace('-', '_'), ...rest }) => {
    const amountRequests = useUncheckedRequests(countField);

    return <MenuItemLink {...rest} to={`/${resource}`} badgeContent={amountRequests || 0} />;
};
