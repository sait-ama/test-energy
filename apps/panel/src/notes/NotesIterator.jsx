import { InfiniteList, WithListContext } from 'react-admin';

import { CreateNote } from './CreateNote.jsx';
import { Note } from './Note';

export const NotesIterator = ({ target, reference }) => {
    return (
        <InfiniteList
            empty={false}
            exporter={null}
            resource="notes"
            filter={{ target_type: reference, target }}
            sort={{ field: 'createdAt', order: 'DESC' }}
            perPage={10}
        >
            <CreateNote reference={reference} target={target} />
            <WithListContext
                render={(context) =>
                    context?.data?.map((record) => <Note note={record} reference={reference} key={record.id} />)
                }
            />
        </InfiniteList>
    );
};
