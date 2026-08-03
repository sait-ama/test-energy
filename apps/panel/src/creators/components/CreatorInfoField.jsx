import { TextField } from 'react-admin';

import CreatorAvatar from './CreatorAvatar';

const CreatorInfoField = () => (
    <div className="flex flex-row items-center gap-4">
        <CreatorAvatar size={32} />
        <div className="flex flex-col">
            <TextField source="name" fontWeight="bold" />
            <TextField source="alt_name" color="textSecondary" fontSize={12} />
        </div>
    </div>
);

export default CreatorInfoField;
