import { Edit, Form, WithRecord } from 'react-admin';
import { Link } from 'react-router-dom';

import { ChevronLeft } from '@mui/icons-material';

import { FeedbackShowBody } from './FeedbackShowBody.jsx';
import { FeedbackShowHeader } from './FeedbackShowHeader.jsx';



const FeedbackShow = () => {
    return (
        <Edit
            sx={{ mt: 2 }}
            actions={
                <Link to="/feedbacks/">
                    <ChevronLeft />
                    Назад
                </Link>
            }
        >
            <WithRecord
                render={(record) => (
                    <Form disabled={record.status === 3 || record.status === 2}>
                        <FeedbackShowHeader />
                        <FeedbackShowBody />
                    </Form>
                )}
            />
        </Edit>
    );
};

export default FeedbackShow;
