import { useRecordContext } from 'react-admin';

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import blue from '@mui/material/colors/blue';
import green from '@mui/material/colors/green';
import orange from '@mui/material/colors/orange';
import red from '@mui/material/colors/red';

// status 0 - open, 1 - pinned, 2 - accepted, 3 - declined

export const IconStatusField = (props) => {
    const { map } = props;
    const { status } = useRecordContext(props);

    const resolved = map[status];

    if (resolved === 'open') return <HighlightOffIcon style={{ color: orange[500] }} />;

    if (resolved === 'accepted') return <CheckCircleOutlineIcon style={{ color: green[500] }} />;

    if (resolved === 'rejected') return <HighlightOffIcon style={{ color: red[500] }} />;

    if (resolved === 'in_progress') {
        return <CheckCircleOutlineIcon style={{ color: blue[500] }} />;
    }
    return null;
};
