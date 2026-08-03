import { useRecordContext } from 'react-admin';

import classes from '../Calls.module.css';

export const CallsStatusField = () => {
    const { status } = useRecordContext();

    if (status.id === 1) {
        return (
            <div className={classes.chipWrapper}>
                <div className={classes.redChip}>В ожидании</div>
            </div>
        );
    }

    if (status.id === 2) {
        return (
            <div className={classes.chipWrapper}>
                <div className={classes.greenChip}>Ведется диалог</div>
            </div>
        );
    }

    if (status.id === 3) {
        return (
            <div className={classes.chipWrapper}>
                <div className={classes.grayChip}>Закрыто</div>
            </div>
        );
    }

    return null;
};
