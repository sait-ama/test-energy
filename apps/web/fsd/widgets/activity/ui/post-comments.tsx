import type { CSSProperties } from 'react';
import * as React from 'react';
import { useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import DotsHorizontal from '@re/ui-kit/icons/dots-horizontal';
import Premium from '@re/ui-kit/icons/premium';
import { Button } from '@re/ui-kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@re/ui-kit/ui/dropdown-menu';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { ActivityBaseStateProvider, OnlyRemovingActivity } from '~entities/activity/model/context';
import { ActivityRepository } from '~entities/activity/model/repository';
import { ActivityItem } from '~entities/activity/ui/activity-item';
import { ActivityItemSkeleton } from '~entities/activity/ui/activity-item-skeleton';
import { ActivityItemSkeletonList } from '~entities/activity/ui/activity-item-skeleton-list';
import { ActivityList } from '~entities/activity/ui/activity-list';
import { getShortName } from '~entities/guild/model/utils';
import { ReportModal } from '~entities/report/ui/report-modal';
import { UserAvatar } from '~entities/user/ui/user-avatar';
import { ActivityItemActions } from '~features/activity/ui/activity-item-actions';
import { ActivityItemContainers } from '~features/activity/ui/activity-item-containers';
import { ActivityListActions } from '~features/activity/ui/activity-list-actions';
import { ActivityStaffActions } from '~features/activity/ui/activity-staff-actions';
import { ActivityForm } from '~features/activity-form';
import type {
  ActivityPaginatedListBaseQuerySchema,
  ActivityTargetQuerySchema,
  CommentSchema,
} from '~shared/api/models/activity';
import { Routing } from '~shared/config/routing';
import { VisibilityControl } from '~shared/lib/auth/visibility-control';
import { QuerySuspenseContainer } from '~shared/lib/react-query/query-suspense-container';
import { TestProps } from '~shared/lib/test/utils/test-props';
import { publicEnv } from '~shared/utils/env';
import { UrlFormatter } from '~shared/utils/url-formatter';
import { ActivityStickerPicker } from '~widgets/activity/ui/fragments/activite-sticker-picker';

const CommentHeadline = ({ data }: any) => (
  <span className="line-clamp-1 flex flex-nowrap items-center gap-1.5 break-all">
    <Link
      prefetch={false}
      href={Routing.User.detail({
        params: {
          tab: 'about',
          id: data.user.id,
        },
      })}
      className="flex flex-nowrap items-center gap-1 self-start md:self-auto"
    >
      <ReText
        style={{
          WebkitBoxOrient: 'horizontal',
        }}
        weight="bold"
        component="span"
        size="sm"
        className={cn('line-clamp-1 md:line-clamp-2', {
          'animate-glitch': data.user.is_superuser,
        })}
      >
        {data.user.username}
      </ReText>
      {data.user.is_premium ? (
        <ReText weight="bold" size="sm">
          <Premium size={14} />
        </ReText>
      ) : null}
    </Link>
    {data.user.main_club ? (
      <Link
        prefetch={false}
        href={Routing.Club.clubByDir({
          params: {
            tab: 'about',
            dir: data.user.main_club.dir,
          },
        })}
        className="self-start leading-none md:self-auto"
      >
        <span>
          <span className="text-xs font-medium">✦</span>
          <ReText
            style={{
              WebkitBoxOrient: 'horizontal',
            }}
            component="span"
            weight="medium"
            size="xs"
            color="muted-foreground"
            className="hover:text-primary! mb-0.5 inline-flex flex-nowrap items-center gap-1.5 transition-colors duration-200"
          >
            &nbsp;
            {getShortName(data.user.main_club.name)}
          </ReText>
        </span>
      </Link>
    ) : null}
  </span>
);

interface PostCommentsProps {
  query?: ActivityPaginatedListBaseQuerySchema;
  target: ActivityTargetQuerySchema;
  className?: string;
  style?: CSSProperties;
  canPinComment?: boolean;
}

function getLastPageIndex(total: number, perPage: number): number {
  return Math.ceil(total / perPage);
}

export const PostComments = ({
  query,
  target,
  className,
  style,
  canPinComment,
}: PostCommentsProps) => {
  const t = useTranslations('reusable.actions');

  const renderItem = useMemo(
    () => (data: CommentSchema, props) => (
      <ActivityBaseStateProvider>
        <ActivityItem data={data} {...props}>
          <ActivityItemActions.Provider>
            <ActivityItem.ContextConsumer>
              {({ data }) => (
                <Link
                  prefetch={false}
                  href={Routing.User.detail({
                    params: {
                      tab: 'about',
                      id: data.user.id,
                    },
                  })}
                >
                  <UserAvatar
                    frameSrc={data.user.frame.high}
                    avatarSrc={data.user.avatar.mid}
                    alt={data.user.username}
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
                        {({ data }) => <CommentHeadline data={data} />}
                      </ActivityItem.ContextConsumer>
                      <div className="flex-1" />
                      <ActivityItem.LeftBy />
                      <ActivityItem.Pinned />

                      <ReportModal type="comment" target={data.id}>
                        {(onOpen) => (
                          <DropdownMenu>
                            <DropdownMenuTrigger {...TestProps.id(`comment_actions_btn`)} asChild>
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
                              <VisibilityControl.ModeratorOnly>
                                <DropdownMenuItem className="w-full py-1" asChild>
                                  <Link
                                    href={UrlFormatter.createUrl(
                                      publicEnv('PANEL_URL'),
                                      `/comments/${data.id}/show/`
                                    )}
                                    target="_blank"
                                  >
                                    Модерка
                                  </Link>
                                </DropdownMenuItem>
                              </VisibilityControl.ModeratorOnly>
                              {canPinComment && (
                                <ActivityItemActions.Pin asChild>
                                  <DropdownMenuItem className="w-full py-1">
                                    Закрепить
                                  </DropdownMenuItem>
                                </ActivityItemActions.Pin>
                              )}
                              <VisibilityControl.OwnerOnly>
                                <OnlyRemovingActivity>
                                  <ActivityItemActions.Edit asChild>
                                    <DropdownMenuItem className="w-full py-1">
                                      Редактировать
                                    </DropdownMenuItem>
                                  </ActivityItemActions.Edit>
                                </OnlyRemovingActivity>
                                <ActivityItemActions.Delete asChild>
                                  <DropdownMenuItem className="w-full py-1">
                                    Удалить
                                  </DropdownMenuItem>
                                </ActivityItemActions.Delete>
                              </VisibilityControl.OwnerOnly>
                              <VisibilityControl.NotOwner>
                                <DropdownMenuItem
                                  {...TestProps.id(`report_comment_btn`)}
                                  onClick={onOpen}
                                  className="w-full py-1"
                                >
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
                                resetOnSubmit
                                className="my-2 w-full"
                                {...props}
                                closeOnSubmit
                              >
                                <ActivityForm.Content onSubmit={props.onSubmit} autoFocus>
                                  <ActivityForm.MarkdownToolbar />
                                  <ActivityForm.TextArea />
                                  <ActivityForm.BottomBar
                                    additionalActions={<ActivityStickerPicker withoutStickers />}
                                  >
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
                    <ActivityForm.Content onSubmit={props.onSubmit} autoFocus>
                      <ActivityForm.MarkdownToolbar />
                      <ActivityForm.TextArea />
                      <ActivityForm.BottomBar additionalActions={<ActivityStickerPicker />}>
                        <ActivityForm.Cancel>Отмена</ActivityForm.Cancel>
                        <ActivityForm.Submit>Ответить</ActivityForm.Submit>
                      </ActivityForm.BottomBar>
                    </ActivityForm.Content>
                  </ActivityForm>
                )}
              </ActivityItemActions.ReplyForm>
              <ActivityItemActions.ShowRepliesButton className="px-1" />
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
                  {({ data, state }) => (
                    <ActivityList
                      value={{
                        queryFn: ActivityRepository.list,
                        target: {
                          reply_to: data.id,
                        },
                        queryProp: {
                          count: 5,
                          page:
                            state.showReplies === 'end'
                              ? getLastPageIndex(data.count_replies, 5)
                              : 1,
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
      </ActivityBaseStateProvider>
    ),
    []
  );

  return (
    <div className={cn('my-2 flex flex-col gap-4', className)} style={style}>
      <ActivityList value={{ queryFn: ActivityRepository.list, target, queryProp: query }}>
        <ActivityListActions.Provider>
          <ActivityListActions.InputForm>
            {(props) => (
              <ActivityForm closeOnSubmit isOpened={false} className="mb-0" {...props}>
                <ActivityForm.Content onSubmit={props.onSubmit}>
                  <ActivityForm.MarkdownToolbar />
                  <ActivityForm.TextArea />
                  <ActivityForm.BottomBar additionalActions={<ActivityStickerPicker />}>
                    <ActivityForm.Cancel {...TestProps.id(`cancel_comment_send_btn`)}>
                      Отмена
                    </ActivityForm.Cancel>
                    <ActivityForm.Submit {...TestProps.id(`send_comment_btn`)}>
                      Отправить
                    </ActivityForm.Submit>
                  </ActivityForm.BottomBar>
                </ActivityForm.Content>
              </ActivityForm>
            )}
          </ActivityListActions.InputForm>
          <ActivityListActions.OrderingTabs />
          <ActivityList.Container>
            <QuerySuspenseContainer
              fallback={
                <ActivityItemSkeletonList SkeletonItem={ActivityItemSkeleton} count={5} max={5} />
              }
            >
              <ActivityList.Content SkeletonItem={ActivityItemSkeleton} renderItem={renderItem} />
            </QuerySuspenseContainer>
          </ActivityList.Container>
        </ActivityListActions.Provider>
      </ActivityList>
    </div>
  );
};
