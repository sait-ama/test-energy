import { useUpdateLinks } from '../layout/index.js';

const LinkUpdater = ({ selector }) => {
    useUpdateLinks(selector);
    return null;
};

export { LinkUpdater };
