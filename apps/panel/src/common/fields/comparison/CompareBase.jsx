import { Typography } from '@mui/material';
import cx from 'clsx';

export const CompareBase = ({ left, right, hidden, leftHidden, rightHidden, className, label, style, ...rest }) => {
    return (
        <div className={cx({ hidden: hidden })}>
            {label ? <Typography variant="body1">{label}</Typography> : null}

            <div className={cx(`flex w-full justify-around mb-0`, className)} style={{ gap: 24, ...style }} {...rest}>
                <div className={cx('flex w-6/12 height-full')}>{!leftHidden ? left : null}</div>
                <div className={cx('flex w-6/12 height-full')}>{!rightHidden ? right : null}</div>
            </div>
        </div>
    );
};
