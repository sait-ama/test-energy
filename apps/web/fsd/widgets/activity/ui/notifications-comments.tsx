import { useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import DotsHorizontal from '@re/ui-kit/icons/dots-horizontal';
import { Button } from '@re/ui-kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@re/ui-kit/ui/dropdown-menu';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { ActivityRepository } from '~entities/activity/model/repository';
import { ActivityItem } from '~entities/activity/ui/activity-item';
import { ActivityItemSkeleton } from '~entities/activity/ui/activity-item-skeleton';
import { ActivityItemSkeletonList } from '~entities/activity/ui/activity-item-skeleton-list';
import { ActivityList } from '~entities/activity/ui/activity-list';
import { ReportModal } from '~entities/report/ui/report-modal';
import { UserAvatar } from '~entities/user/ui/user-avatar';
import { ActivityItemActions } from '~features/activity/ui/activity-item-actions';
import { ActivityItemContainers } from '~features/activity/ui/activity-item-containers';
import { ActivityListActions } from '~features/activity/ui/activity-list-actions';
import { ActivityStaffActions } from '~features/activity/ui/activity-staff-actions';
import { ActivityForm } from '~features/activity-form';
import type {
  ActivityPaginatedListQuerySchema,
  ActivityTargetQuerySchema,
  CommentSchema,
} from '~shared/api/models/activity';
import { Routing } from '~shared/config/routing';
import { VisibilityControl } from '~shared/lib/auth/visibility-control';
import { QuerySuspenseContainer } from '~shared/lib/react-query/query-suspense-container';
import { TestProps } from '~shared/lib/test/utils/test-props';
import { publicEnv } from '~shared/utils/env';
import { UrlFormatter } from '~shared/utils/url-formatter';

interface CommentsProps {
  query?: ActivityPaginatedListQuerySchema<ActivityTargetQuerySchema>;
  target: ActivityTargetQuerySchema;
}

export const NotificationsComments = ({ target, query }: CommentsProps) => {
  const t = useTranslations('reusable.actions');
  const renderItem = useMemo(
    () => (data: CommentSchema, props) => (
      <ActivityItem data={data} {...props}>
        <ActivityItemActions.Provider showReplies>
          <ActivityItem.ContextConsumer>
            {({ data }) => (
              <Link
                prefetch={false}
                href={Routing.User.detail({
                  params: {
                    id: data.user.id,
                    tab: 'about',
                  },
                })}
              >
                <UserAvatar
                  avatarSrc={data.user.avatar.mid}
                  alt={`${data.user.username}_avatar`}
                  className={cn('h-10 w-10')}
                />
              </Link>
            )}
          </ActivityItem.ContextConsumer>
          <div className="flex w-full flex-col items-start">
            <ActivityItemContainers.Deleting>
              <ActivityItemContainers.Updating>
                <ActivityItem.Card>
                  <ActivityItem.Header>
                    <ActivityItem.ContextConsumer>
                      {({ data }) => (
                        <Link
                          prefetch={false}
                          href={Routing.User.detail({
                            params: {
                              id: data.user.id,
                              tab: 'about',
                            },
                          })}
                          className="line-clamp-1 break-all"
                        >
                          <ReText
                            weight="bold"
                            size="sm"
                            className={cn({ 'animate-glitch': data.user.is_superuser })}
                          >
                            {data.user.username}
                          </ReText>
                        </Link>
                      )}
                    </ActivityItem.ContextConsumer>
                    <div className="flex-1" />
                    <ActivityItem.Pinned />
                    <ReportModal type="comment" target={data.id} fallback={<DotsHorizontal />}>
                      {(onOpen) => (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" circle className="-m-1">
                              <DotsHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="p-1">
                            <VisibilityControl.ModeratorOnly>
                              <ActivityStaffActions.Ban asChild>
                                <DropdownMenuItem
                                  {...TestProps.id(`ban_comment_btn`)}
                                  className="w-full py-1"
                                >
                                  Забанить
                                </DropdownMenuItem>
                              </ActivityStaffActions.Ban>
                            </VisibilityControl.ModeratorOnly>
                            <VisibilityControl.ModeratorOnly>
                              <DropdownMenuItem className="w-full py-1" asChild>
                                <Link
                                  prefetch={false}
                                  target="_blank"
                                  href={UrlFormatter.createUrl(
                                    publicEnv('ADMIN_URL'),
                                    `/activity/comments/${data.id}/change/`
                                  )}
                                >
                                  Админка
                                </Link>
                              </DropdownMenuItem>
                            </VisibilityControl.ModeratorOnly>
                            <VisibilityControl.OwnerOnly>
                              <ActivityItemActions.Edit asChild>
                                <DropdownMenuItem className="w-full py-1">
                                  Редактировать
                                </DropdownMenuItem>
                              </ActivityItemActions.Edit>
                              <ActivityItemActions.Delete asChild>
                                <DropdownMenuItem className="w-full py-1">Удалить</DropdownMenuItem>
                              </ActivityItemActions.Delete>
                            </VisibilityControl.OwnerOnly>
                            <VisibilityControl.NotOwner>
                              <DropdownMenuItem onClick={onOpen} className="w-full py-1">
                                {t('report')}
                              </DropdownMenuItem>
                            </VisibilityControl.NotOwner>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </ReportModal>
                  </ActivityItem.Header>
                  <ActivityItemActions.ContextConsumer>
                    {({ state }) =>
                      state.isEditing ? (
                        <ActivityItemActions.EditForm>
                          {(props) => (
                            <ActivityForm
                              className="my-2 w-full"
                              {...props}
                              resetOnSubmit
                              closeOnSubmit
                            >
                              <ActivityForm.Content>
                                <ActivityForm.MarkdownToolbar />
                                <ActivityForm.TextArea />
                                <ActivityForm.BottomBar>
                                  <ActivityForm.Cancel>Отмена</ActivityForm.Cancel>
                                  <ActivityForm.Submit>Изменить</ActivityForm.Submit>
                                </ActivityForm.BottomBar>
                              </ActivityForm.Content>
                            </ActivityForm>
                          )}
                        </ActivityItemActions.EditForm>
                      ) : (
                        <ActivityItem.Content />
                      )
                    }
                  </ActivityItemActions.ContextConsumer>
                </ActivityItem.Card>
              </ActivityItemContainers.Updating>
            </ActivityItemContainers.Deleting>
            <ActivityItem.Footer className="min-h-8 w-full gap-1">
              <ActivityItem.Date />
              <ActivityItemActions.Reply />
              <div className="ml-auto flex flex-row gap-0.5">
                <ActivityItemActions.Like className="items-center" />
                <ActivityItemActions.Dislike className="items-center" />
              </div>
            </ActivityItem.Footer>
            <ActivityItemActions.ReplyForm>
              {(props) => (
                <ActivityForm className="my-2 w-full" {...props}>
                  <ActivityForm.Content>
                    <ActivityForm.MarkdownToolbar />
                    <ActivityForm.TextArea />
                    <ActivityForm.BottomBar>
                      <ActivityForm.Cancel>Отмена</ActivityForm.Cancel>
                      <ActivityForm.Submit>Ответить</ActivityForm.Submit>
                    </ActivityForm.BottomBar>
                  </ActivityForm.Content>
                </ActivityForm>
              )}
            </ActivityItemActions.ReplyForm>
            <QuerySuspenseContainer
              fallback={
                <ActivityItemSkeletonList
                  SkeletonItem={ActivityItemSkeleton}
                  count={data.count_replies}
                  max={5}
                />
              }
            >
              <ActivityItemActions.RepliesContainer>
                {({ data }) => (
                  <ActivityList
                    value={{
                      queryFn: ActivityRepository.list,
                      target: {
                        reply_to: data.id,
                      },
                      queryProp: {
                        count: 5,
                        page: 1,
                      },
                    }}
                  >
                    {}
                    <ActivityListActions.ProviderWithSublist>
                      <ActivityList.Container className="py-2">
                        <ActivityList.Content
                          SkeletonItem={ActivityItemSkeleton}
                          renderItem={renderItem}
                        />
                      </ActivityList.Container>
                    </ActivityListActions.ProviderWithSublist>
                  </ActivityList>
                )}
              </ActivityItemActions.RepliesContainer>
            </QuerySuspenseContainer>
          </div>
        </ActivityItemActions.Provider>
      </ActivityItem>
    ),
    []
  );

  return (
    // @ts-ignore
    <ActivityList value={{ queryFn: ActivityRepository.oneToList, target, queryProp: query }}>
      <ActivityListActions.Provider>
        <ActivityList.Container>
          <QuerySuspenseContainer
            fallback={
              <ActivityItemSkeletonList SkeletonItem={ActivityItemSkeleton} count={1} max={1} />
            }
          >
            <ActivityList.Content SkeletonItem={ActivityItemSkeleton} renderItem={renderItem} />
          </QuerySuspenseContainer>
        </ActivityList.Container>
      </ActivityListActions.Provider>
    </ActivityList>
  );
};
