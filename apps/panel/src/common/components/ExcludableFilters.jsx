import { useEffect, useState } from 'react';
import { useListContext } from 'react-admin';

import { Box, Checkbox } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';

export const IncludeExcludeFilter = ({ choices, name, renderCount }) => {
    const { setFilters, filterValues } = useListContext();
    const [items, setItems] = useState([]);

    useEffect(() => {
        setItems((prev) => {
            const newValue = [...prev];

            if (filterValues?.[name]?.length) {
                newValue.push(...(filterValues?.[name] || []).map((item) => ({ id: item, status: 'include' })));
            }

            if (filterValues?.[`${name}!`]?.length) {
                newValue.push(...(filterValues?.[`${name}!`] || []).map((item) => ({ id: item, status: 'exclude' })));
            }

            return newValue;
        });
    }, []);

    const handleSelect = (item, method) => {
        setItems((prev) => {
            let newValue = prev;
            switch (method) {
                case 'remove': {
                    newValue = [...prev.filter((it) => it.id !== item.id)];
                    break;
                }
                case 'include': {
                    const index = prev.map((it) => it.id).indexOf(item.id);

                    if (index !== -1) {
                        const newArr = [...prev];
                        newArr[index] = { ...newArr[index], status: 'include' };
                        newValue = newArr;
                        break;
                    }

                    newValue = [...prev, { ...item, status: 'include' }];
                    break;
                }
                case 'exclude': {
                    const index = prev.map((it) => it.id).indexOf(item.id);

                    if (index !== -1) {
                        const newArr = [...prev];
                        newArr[index] = { ...newArr[index], status: 'exclude' };
                        newValue = newArr;
                        break;
                    }

                    newValue = [...prev, { ...item, status: 'exclude' }];
                }
            }

            setFilters({
                ...filterValues,
                [name]: newValue.filter((it) => it.status === 'include').map((it) => it.id),
                [`${name}!`]: newValue.filter((it) => it.status === 'exclude').map((it) => it.id),
            });

            return newValue;
        });
    };

    return (
        <Box>
            {choices.map((choice) => {
                const item = items.find((it) => it.id === choice.id);
                const newStatus =
                    item && item.status === 'include'
                        ? 'exclude'
                        : item && item.status === 'exclude'
                          ? 'remove'
                          : 'include';

                return (
                    <div className="flex justify-between items-center" key={choice.id}>
                        <FormControlLabel
                            key={choice.id}
                            label={`${choice.name}`}
                            control={
                                <Checkbox
                                    checked={item?.status === 'include' || item?.status === 'exclude'}
                                    indeterminate={item?.status === 'exclude'}
                                    onChange={() => handleSelect(choice, newStatus)}
                                />
                            }
                        />
                        {renderCount?.(choice)}
                    </div>
                );
            })}
        </Box>
    );
};
