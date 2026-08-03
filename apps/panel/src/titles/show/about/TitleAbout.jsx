import {
    ArrayField,
    ChipField,
    DateField,
    FunctionField,
    Labeled,
    ReferenceArrayField,
    RichTextField,
    SelectField,
    SingleFieldList,
    UrlField,
} from 'react-admin';

import { Box } from '@mui/material';
import Divider from '@mui/material/Divider';
import dayjs from 'dayjs';

import { BranchesDatagrid } from '../../../branches/list/BranchesDatagrid.jsx';
import useTitleTypes from '../../../hooks/useTitleTypes.js';

export const TitleAbout = () => {
    const { list, isLoading } = useTitleTypes();

    if (isLoading) return null;

    return (
        <Box>
            <Box sx={{ padding: 4 }} flexDirection="column" display="flex">
                <Labeled>
                    <RichTextField source="description" label="Описание: " />
                </Labeled>

                <Box display="flex" gap={2}>
                    <Labeled>
                        <SelectField choices={list.status} source="status" label="Статус: " />
                    </Labeled>
                    <Labeled>
                        <SelectField
                            choices={list.translate_status}
                            source="translate_status"
                            label="Статус перевода: "
                        />
                    </Labeled>
                </Box>

                <Box gap={4} pt={0.5} display="flex" flexDirection="row" fullWidth>
                    <Labeled sx={{ mt: 1 }}>
                        <DateField source="upload_date" label="Дата создания: " />
                    </Labeled>
                    <Labeled sx={{ mt: 1 }}>
                        <DateField source="first_chapter_uploaded" label="Дата первого залива: " />
                    </Labeled>
                    <Labeled sx={{ mt: 1 }}>
                        <DateField source="last_chapter_uploaded" label="Дата последнего залива: " />
                    </Labeled>
                    <Labeled sx={{ mt: 1 }}>
                        <FunctionField
                            label="Дней с последнего залива: "
                            render={(record) => {
                                if (!record.last_chapter_uploaded) return '-';
                                return dayjs().diff(record.last_chapter_uploaded, 'day');
                            }}
                        />
                    </Labeled>
                </Box>

                <Labeled>
                    <ReferenceArrayField source="categories" label="Категории" reference="categories">
                        <SingleFieldList>
                            <ChipField source="name" size="small" />
                        </SingleFieldList>
                    </ReferenceArrayField>
                </Labeled>
                <Labeled>
                    <ReferenceArrayField source="genres" label="Жанры" reference="genres">
                        <SingleFieldList>
                            <ChipField source="name" size="small" />
                        </SingleFieldList>
                    </ReferenceArrayField>
                </Labeled>

                <Divider sx={{ my: 1 }}>Ссылки</Divider>

                <FunctionField
                    render={(record) => (
                        <Box>
                            {Object.entries(record.additional ?? {})
                                .filter(([key, value]) => key.includes('link') && value)
                                .map(([key]) => (
                                    <Box key={key}>
                                        <Labeled label={key}>
                                            <UrlField key={key} name={key} source={`additional.${key}`} />
                                        </Labeled>
                                    </Box>
                                ))}
                        </Box>
                    )}
                />
                <Divider sx={{ my: 1 }}>Ветки</Divider>

                <ArrayField source="branches" label="Ветки">
                    <BranchesDatagrid />
                </ArrayField>
            </Box>
        </Box>
    );
};
