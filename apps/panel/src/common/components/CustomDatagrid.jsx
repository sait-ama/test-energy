import { Datagrid, DatagridBody, DatagridRow, useCreatePath, useResourceContext } from 'react-admin';

const CustomDatagridRow = (props) => {
    const createPath = useCreatePath();
    const resource = useResourceContext();

    const handleMouseDown = (event) => {
        if (event.button === 1) {
            const url = createPath({ ...props, resource, type: 'show' });

            window.open(url);
        }
    };

    return <DatagridRow {...props} onMouseDown={handleMouseDown} />;
};

const CustomDatagridBody = (props) => {
    return <DatagridBody row={<CustomDatagridRow />} {...props} />;
};

export const CustomDatagrid = (props) => <Datagrid body={<CustomDatagridBody />} {...props} />;
