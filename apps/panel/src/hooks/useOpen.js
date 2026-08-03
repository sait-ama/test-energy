import { useState } from 'react';

export const useOpen = (initial = false, canOpen = true, onFailOpen = () => null) => {
    const [open, setOpen] = useState(initial);

    const toggle = () => (canOpen ? setOpen(!open) : onFailOpen());
    const close = () => setOpen(false);

    return [open, toggle, close];
};
