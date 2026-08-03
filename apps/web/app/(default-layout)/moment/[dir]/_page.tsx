'use client';
import * as React from 'react';
import {useParams} from 'next/navigation';

import {useQueryClient, useSuspenseQuery} from '@tanstack/react-query';

import {MomentPreview} from '~entities/inventory/ui/moment-preview';
import {reV2TitlesMomentsRetrieveOptions} from '~entities/moment/model/queries';
import {LikeMoment} from '~features/like-moment/ui/like-moment';
import {RemoveMoment} from '~features/remove-moment/ui/remove-moment';
import {v2TitlesMomentsRetrieveQueryKey} from '~shared/api/generated/tanstack';
import {MomentSchema} from '~shared/api/models/inventory';
import {useSession} from '~shared/lib/session/use-session';
import {getAbbreviatedNumber} from '~shared/utils/get-abbreviated-number';

const MomentActions = ({model}: { model: MomentSchema }) => {
    const session = useSession();
    const hasAbility2Remove = session?.id === model?.author?.id || session?.is_staff;
    const queryClient = useQueryClient();

    const handleLike = async () => {
        await queryClient.refetchQueries({
            queryKey: v2TitlesMomentsRetrieveQueryKey({path: {moment_dir: model.dir!}}),
        });
    };

    return (
        <span className="flex items-center gap-2">
      <LikeMoment className="h-9" model={model} onSuccess={handleLike}>
        {(score) => getAbbreviatedNumber(score)}
      </LikeMoment>
            {hasAbility2Remove ? <RemoveMoment model={model}/> : null}
    </span>
    );
};

export const Moment = () => {
    const params = useParams<{ dir: string }>();
    const {data} = useSuspenseQuery(
        reV2TitlesMomentsRetrieveOptions({
            api: {path: {moment_dir: params.dir}},
            suspense: true,
        })
    );

    return <MomentPreview model={data} actions={<MomentActions model={data}/>}/>;
};
