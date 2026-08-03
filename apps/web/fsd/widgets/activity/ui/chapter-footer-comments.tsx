import type { CSSProperties } from 'react';
import { useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
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
import { ActivityList, ActivityListContentItems } from '~entities/activity/ui/activity-list';
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
import { ActivityStickerPicker } from '~widgets/activity/ui/fragments/activite-sticker-picker';

import { ActivityWidgetInViewConsumer, ActivityWidgetInViewProvider } from '../model/store';

const placeholder =
  'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

interface ChapterFooterCommentsProps {
  query?: ActivityPaginatedListBaseQuerySchema;
  target: ActivityTargetQuerySchema;
  className?: string;
  style?: CSSProperties;
  canPinComment?: boolean;
}

function getLastPageIndex(total: number, perPage: number): number {
  return Math.ceil(total / perPage);
}

export const ChapterFooterComments = ({
  query,
  target,
  className,
  style,
  canPinComment,
}: ChapterFooterCommentsProps) => {
  const t = useTranslations('reusable.actions');
  const [inViewRef, inView] = useInView();

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
                    params: { tab: 'about', id: data.user.id },
                  })}
                >
                  <ActivityWidgetInViewConsumer>
                    {({ inView }) => (
                      <UserAvatar
                        frameSrc={inView ? data.user.frame.high : placeholder}
                        avatarSrc={inView ? data.user.avatar.mid : placeholder}
                        alt={data.user.username}
                        className={cn('h-10 w-10')}
                      />
                    )}
                  </ActivityWidgetInViewConsumer>
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
                                tab: 'about',
                                id: data.user.id,
                              },
                            })}
                            className="line-clamp-1 flex flex-nowrap items-center gap-1 break-all"
                          >
                            <ReText
                              style={{
                                WebkitBoxOrient: 'horizontal',
                              }}
                              weight="bold"
                              size="sm"
                              className={cn('line-clamp-1 md:line-clamp-2', {
                                'animate-glitch': data.user.is_superuser,
                              })}
                            >
                              {data.user.username}
                            </ReText>
                            <ReText weight="bold" size="sm">
                              {data.user.is_premium ? <Premium size={14} className="mb-1" /> : null}
                            </ReText>
                          </Link>
                        )}
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
                              <VisibilityControl.OwnerOnly>
                                {canPinComment && (
                                  <ActivityItemActions.Pin asChild>
                                    <DropdownMenuItem className="w-full py-1">
                                      Закрепить
                                    </DropdownMenuItem>
                                  </ActivityItemActions.Pin>
                                )}
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
    <ActivityWidgetInViewProvider inView={inView}>
      <div className={cn('my-2 flex flex-col gap-4', className)} style={style} ref={inViewRef}>
        <ActivityList
          value={{
            inView,
            queryFn: ActivityRepository.list,
            target,
            queryProp: { ...query, ordering: '-score' },
          }}
        >
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
            <ActivityList.Container>
              <QuerySuspenseContainer
                fallback={
                  <ActivityItemSkeletonList SkeletonItem={ActivityItemSkeleton} count={3} max={3} />
                }
              >
                <ActivityListContentItems renderItem={(data, props) => renderItem(data)} />
              </QuerySuspenseContainer>
            </ActivityList.Container>
          </ActivityListActions.Provider>
        </ActivityList>
      </div>
    </ActivityWidgetInViewProvider>
  );
};
