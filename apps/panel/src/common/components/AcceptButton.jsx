import { useNotify, useRedirect, useUpdate } from 'react-admin';

import { Button } from '@mui/material';
import PropTypes from 'prop-types';

export const AcceptButton = (props) => {
    const {
        resourceId,
        resource,
        record,
        bodyParams,
        redirectTo,
        notifyTextSuccess,
        notifyTextFail,
        buttonText,
        classes,
        getLink,
        color,
        disabled,
    } = props;

    const notify = useNotify();
    const redirect = useRedirect();

    const [update, { isLoading }] = useUpdate(
        resource,
        {
            id: resourceId || record?.id,
            data: bodyParams,
            previousData: record,
        },
        {
            // mutationMode: 'undoable',
            onSuccess: () => {
                notify(notifyTextSuccess, {
                    type: 'info',
                    undoable: false,
                });
                if (getLink && record) window.open(getLink, '_blank');
                if (redirectTo) redirect(redirectTo);
            },
            onError: (error) => {
                console.log('errror', error.msg, error.message);
                notify(`${notifyTextFail}: ${error.message}`, {
                    type: 'warning',
                });
            },
        },
    );

    return (
        <Button
            disabled={disabled || isLoading}
            onClick={async () => update()}
            className={classes}
            variant="outlined"
            color={color}
        >
            {buttonText}
        </Button>
    );
};

AcceptButton.propTypes = {
    resource: PropTypes.string.isRequired,
    record: PropTypes.object.isRequired,
    bodyParams: PropTypes.object.isRequired,
    notifyTextSuccess: PropTypes.string.isRequired,
    notifyTextFail: PropTypes.string.isRequired,
    redirectTo: PropTypes.string,
    buttonText: PropTypes.string.isRequired,
    classes: PropTypes.object,
    getLink: PropTypes.string,
    color: PropTypes.string,
};
