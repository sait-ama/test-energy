import { useState } from 'react';
import { ReferenceField } from 'react-admin';

import { Popover } from '@mui/material';
import UserInfoField from 'src/users/components/UserInfoField.jsx';
import { UserPopoverCard } from 'src/users/components/UserPopoverCard.jsx';

export const UserInfoWithDetailsPopover = ({ source, ...rest }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
        event.stopPropagation();
    };
    const handleClose = (event) => {
        setAnchorEl(null);
        event.stopPropagation();
    };

    const open = Boolean(anchorEl);
    // const id = open ? 'simple-popover' : undefined;

    return (
        <>
            <UserInfoField source={source} {...rest} onClick={handleClick} />
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                {/*{open && (*/}
                <ReferenceField source={source ? `${source}.id` : 'id'} reference="users">
                    <UserPopoverCard />
                </ReferenceField>
                {/*)}*/}
            </Popover>
        </>
    );
};
