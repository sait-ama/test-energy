import { Notification as RANotification } from 'react-admin';

export const Notification = (props) => {
    return (
        <RANotification
            {...props}
            // anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            // autoHideDuration={5000}
        />
    );
};
