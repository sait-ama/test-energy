import { Edit, Form, WithRecord } from 'react-admin';
import { Link } from 'react-router-dom';

import { ChevronLeft } from '@mui/icons-material';
// import classes from '../Reports.module.css';
import { ReportShowAside } from 'src/reports/show/ReportShowAside.jsx';
import { ReportShowBody } from 'src/reports/show/ReportShowBody.jsx';
import { ReportShowFooter } from 'src/reports/show/ReportShowFooter.jsx';
import { ReportShowHeader } from 'src/reports/show/ReportShowHeader.jsx';

import { LinkUpdater } from '../../common/components/LinkUpdater';

const linksUpdateSelector = (record) => (state) =>
    record.target?.links
        ? {
              ...state,
              link: record.target.links[0]?.link,
              adminLink: record.target.links[1]?.link,
              moderLink: record.target.links[2]?.link,
          }
        : state;

const ReportShow = () => {
    return (
        <Edit
            sx={{ mt: 2 }}
            aside={<ReportShowAside />}
            actions={
                <Link to="/reports/">
                    <ChevronLeft />
                    Назад
                </Link>
            }
        >
            <WithRecord
                render={(record) => (
                    <Form disabled={record.status === 3 || record.status === 2}>
                        <LinkUpdater selector={linksUpdateSelector} />
                        <ReportShowHeader />
                        <ReportShowBody />
                        <ReportShowFooter />
                    </Form>
                )}
            />
        </Edit>
    );
};

export default ReportShow;
