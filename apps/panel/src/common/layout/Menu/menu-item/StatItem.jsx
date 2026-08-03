import GroupIcon from '@mui/icons-material/Group';

import { useCountRequests } from '../../../../hooks/useUncheckedRequests.js';
import { MenuItemLink } from "../MenuItemLink";

export const StatItem = () => {
    const {data, isLoading} = useCountRequests();

    if (isLoading || !data.show_withdraw) return null;
    
    return <MenuItemLink to="/statistics" label="Статистика" icon={GroupIcon} />;
};