import type { ComponentPropsWithoutRef, ForwardedRef, ReactNode } from 'react';
import React, { forwardRef, Suspense } from 'react';

import dayjs from 'dayjs';

import { Skeleton } from '@re/ui-kit/ui/skeleton';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { RequestItemProvider, useRequestItem } from '~entities/request/model/store';
import { RequestItemAutosave } from '~entities/request/ui/request-item-autosave';
import { RequestItemStatus } from '~entities/request/ui/request-item-status';
import { getUserRequest } from '~entities/user/model/queries';
import type { ChangeRequestSchema, UserRequestResponseSchema } from '~shared/api/models/panel';
import { requestNameMap } from '~shared/api/models/panel';
import { ContentSuspenseQuery } from '~shared/lib/react-query/content-suspense-query';
import { getClientDate } from '~shared/utils/get-client-date';

interface RequestItemTriggerProps extends ComponentPropsWithoutRef<'div'> {
  action?: ReactNode;
}

export const RequestItemTrigger = (props: RequestItemTriggerProps) => {
  const { action, className, ...rest } = props;
  const model = useRequestItem();
  const clientDate = getClientDate({ serverDateString: model.updated_at || model.created_at })!;

  return (
    <div className={cn('flex w-full', className)} {...rest}>
      <div className="flex flex-1 flex-col items-center justify-between gap-2">
        <span className="flex w-full items-center justify-between">
          <ReText weight="semibold" size="md">
            {requestNameMap[model.type] ?? `№${model.id}`}
          </ReText>
          <div className="flex items-center gap-2">
            <RequestItemAutosave autoSave={model.auto_save} />
            <RequestItemStatus status={model.status} />
            {action}
          </div>
        </span>
        <span className="flex w-full items-center justify-between">
          <ReText
            color="muted-foreground"
            lineClamp={1}
            className="self-start"
            weight="medium"
            size="sm"
          >
            {model.request_name}
          </ReText>
          <ReText
            lineClamp={1}
            color="muted-foreground"
            className="self-start"
            weight="medium"
            size="sm"
          >
            {dayjs(clientDate).format('DD.MM.YYYY в H:mm')}
          </ReText>
        </span>
      </div>
    </div>
  );
};

interface RequestItemContentProps extends ComponentPropsWithoutRef<'div'> {
  renderContent: (opts: { data: UserRequestResponseSchema }) => ReactNode;
}

export const RequestItemContent = (props: RequestItemContentProps) => {
  const { className, renderContent, ...rest } = props;
  const model = useRequestItem();

  return (
    <div className={cn('', className)} {...rest}>
      <Suspense fallback={<Skeleton className="h-20 w-full rounded-md" />}>
        <ContentSuspenseQuery
          queryOptions={getUserRequest({
            variables: {
              params: {
                requestId: model.id,
              },
            },
          })}
        >
          {({ data }: { data: UserRequestResponseSchema }) => renderContent({ data })}
        </ContentSuspenseQuery>
      </Suspense>
    </div>
  );
};

interface RequestItemProps extends ComponentPropsWithoutRef<'div'> {
  model: ChangeRequestSchema;
  withHover?: boolean;
}

export const RequestItemContainer = forwardRef(
  (props: RequestItemProps, ref: ForwardedRef<HTMLDivElement>) => {
    const { model, className, children, style, withHover } = props;

    return (
      <RequestItemProvider value={model}>
        <div
          ref={ref}
          className={cn(
            'border-border flex flex-col gap-2 overflow-hidden rounded-sm border p-4',
            withHover && 'hover-card',
            className
          )}
          style={style}
        >
          {children}
        </div>
      </RequestItemProvider>
    );
  }
);
