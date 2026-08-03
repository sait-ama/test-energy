import { SelectInput,TextInput } from 'react-admin';

import useGetPublisherTypes from 'src/hooks/usePublisherTypes.js';

export const RequestTeamAdd = () => {
    const { list: publisherTypes, isLoading: isPublisherTypesLoading } = useGetPublisherTypes();

    if (isPublisherTypesLoading) return null;

    return (
        <>
            <TextInput source="data.name" label="Название команды" variant="outlined" fullWidth name="data.name" />
            <TextInput source="data.vk" name="data.vk" label="Ссылка на VK" variant="outlined" fullWidth />
            <SelectInput
                source="data.type"
                name="data.type"
                label="Тип паблишера"
                variant="outlined"
                options={{
                    maxWidth: '200px',
                    suggestionsContainerProps: {
                        placement: 'bottom',
                        disablePortal: true,
                    },
                }}
                fullWidth
                choices={publisherTypes.type}
            />
        </>
    );
};
