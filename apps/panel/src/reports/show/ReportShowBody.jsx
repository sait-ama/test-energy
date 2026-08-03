import React from 'react';
import { Link,useRecordContext } from 'react-admin';

import { Box, Button } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import cx from 'clsx';
import { decodeHTMLEntities } from 'src/utils/decodeHTMLEntities';

import { ModeratorMessageField } from '../../common/fields/ModeratorMessageField';
import { ReportType } from '../const';

import { PUT } from './../../utils/fetcher';

import classes from '../Reports.module.css';

const UserLink = ({ id }) => (
    <Link target="_blank" to={`/users/${id}/show`} className={classes.rowContentValue}>
        Вот этот
    </Link>
);

const PublisherLink = ({ id }) => (
    <Link target="_blank" to={`/publishers/${id}/show`} className={classes.rowContentValue}>
        Вот эти
    </Link>
);

const CreatorLink = ({ id }) => (
    <Link target="_blank" to={`/creators/${id}/show`} className={classes.rowContentValue}>
        Вот этот автор
    </Link>
);

const CardLink = ({ id }) => (
    <Link target="_blank" to={`/cards/${id}`} className={classes.rowContentValue}>
        Вот эта карточка
    </Link>
);

const PostLink = ({ dir }) => (
    <Link target="_blank" to={`${import.meta.env.VITE_URL}/forum/posts/${dir}`} className={classes.rowContentValue}>
        Вот этот пост
    </Link>
);


const Dolboyeb = (props) => {
    const { type, model } = props;

    if (!model) return;

    switch (type) {
        case 1: // 'Тайтл'
            return <PublisherLink id={model.publisher} />;
        case 2: // 'Глава'
            return <PublisherLink id={model.publishers[0]} />;
        case 3: // 'Паблишер':
            return <PublisherLink id={model.id} />;
        case 4: // 'Коммент'
            return <UserLink id={model.user.id} />;
        case 5: // 'Автор'
            return <CreatorLink id={model.id} />;
        case 6: // 'Юзер'
            return <UserLink id={model.id} />;
        case 8: // 'Карточка'
            return <UserLink id={model.author} />;
        case 7: // 'Пост'
            return <PostLink dir={model.dir} />;
        case 0:
        default:
            return 'Неподдерживаемый тип репорта';
    }
};

const CommentActions = () => {
    const data = useRecordContext();

    const { id, is_blocked, is_spoiler, text, is_pinned } = data?.target?.model ?? {};

    const [banned, setBanned] = React.useState(is_blocked);
    const [spoiler, setSpoiler] = React.useState(is_spoiler);

    const [bLoading, setBloading] = React.useState(false);
    const [sLoading, setSLoading] = React.useState(false);

    const inWork = data.status == 1;

    const handleBan = () => {
        setBloading(true);
        PUT(`/api/activity/comments/${id}/ban/`)
            .catch((e) => {
                setBloading(false);
                console.log(e);
            })
            .then(() => {
                setBanned(true);
                setBloading(false);
            });
    };

    const handleChangeSpoiler = () => {
        setSLoading(true);
        PUT(`/api/activity/comments/${id}/`, {
            is_spoiler: !spoiler,
            text: decodeHTMLEntities(text),
            is_pinned,
        })
            .catch((e) => {
                setSLoading(false);
                console.log(e);
            })
            .then(() => {
                setSLoading(false);
                setSpoiler(!spoiler);
            });
    };

    return (
        <div className="pt-4 flex gap-8">
            <Button variant="outlined" onClick={handleBan} disabled={!inWork || bLoading || banned}>
                {banned ? 'Забанено' : 'Забанить'}
            </Button>
            <FormControlLabel
                disabled={!inWork || sLoading}
                label="Спойлер"
                checked={spoiler}
                control={<Switch />}
                onChange={handleChangeSpoiler}
            />
        </div>
    );
};

const ReportTargetRow = ({ type, model }) => {
    let entityView = null;

    if (type === ReportType.HERO_CARD && model) {
        entityView = <CardLink id={model.id} />;
    }

    if (!entityView) return null;

    return (
        <div className={classes.row}>
            <div className={classes.rowContent}>
                <div className={classes.rowContentName}>{`Репорт на:`}</div>
                <div className={classes.rowContentValue}>{entityView}</div>
            </div>
        </div>
    );
};

const ReportnameRow = ({ data }) => {
    const valueProps =
        data.type === ReportType.COMMENT
            ? {
                dangerouslySetInnerHTML: { __html: decodeHTMLEntities(data.target.name) },
            }
            : { children: data.target.name };
    return (
        <div className={classes.row}>
            <div className={classes.rowContent}>
                <div className={classes.rowContentName}>{`Название:`}</div>
                <div className={classes.rowContentValue} {...valueProps} />
            </div>
        </div>
    );
};

export const ReportShowBody = () => {
    const data = useRecordContext();

    if (!data) return null;

    return (
        <Box p={4}>
            <ReportnameRow data={data} />
            <div className={classes.row}>
                <div className={cx(classes.rowContent, 'mb-0')}>
                    <div className={classes.rowContentName}>{`Причина:`}</div>
                    <div className={classes.rowContentValue}>{data.reason.name}</div>
                </div>
            </div>
            <div className={classes.row}>
                <div className={cx(classes.rowContent, 'mb-0')}>
                    <div className={classes.rowContentName}>Провинившийся</div>
                    <Dolboyeb type={data.type} model={data.target.model} />
                </div>
            </div>
            <div className={classes.row}>
                <div className={classes.rowContent}>
                    <div className={classes.rowContentName}>{`Сообщение:`}</div>
                    <div className={classes.rowContentValue}>{data.message}</div>
                </div>
            </div>
            <div className={classes.row}>
                <div className={cx(classes.rowContent, 'mb-0')}>
                    <div className={classes.rowContentName}>Репортер:</div>
                    <Link to={`/users/${data.user?.id}/show`} className={classes.rowContentValue}>
                        {data.user?.username}
                    </Link>
                </div>
            </div>

            <ReportTargetRow type={data.type} model={data.target.model} />

            {data.type === ReportType.COMMENT ? <CommentActions /> : null}

            <ModeratorMessageField baseName="reports" sx={{ mt: 3 }} />
        </Box>
    );
};
