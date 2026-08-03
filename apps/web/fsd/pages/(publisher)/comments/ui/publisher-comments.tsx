'use client';
import * as React from 'react';
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

import { useContentType } from '~app/providers/site-config-provider';
import { ActivityBaseStateProvider } from '~entities/activity/model/context';
import { ActivityRepository } from '~entities/activity/model/repository';
import { ActivityItem } from '~entities/activity/ui/activity-item';
import { ActivityItemSkeleton } from '~entities/activity/ui/activity-item-skeleton';
import { ActivityItemSkeletonList } from '~entities/activity/ui/activity-item-skeleton-list';
import { ActivityList } from '~entities/activity/ui/activity-list';
import { ReportModal } from '~entities/report/ui/report-modal';
import { TitleImage } from '~entities/title/ui/title-image';
import { UserAvatar } from '~entities/user/ui/user-avatar';
import { ActivityItemActions } from '~features/activity/ui/activity-item-actions';
import { ActivityItemContainers } from '~features/activity/ui/activity-item-containers';
import { ActivityListActions } from '~features/activity/ui/activity-list-actions';
import { ActivityStaffActions } from '~features/activity/ui/activity-staff-actions';
import { ActivityForm } from '~features/activity-form';
import type {
  ActivityTargetQuerySchema,
  CommentSchema,
  PublisherCommentTarget,
} from '~shared/api/models/activity';
import { Routing } from '~shared/config/routing';
import { VisibilityControl } from '~shared/lib/auth/visibility-control';
import { QuerySuspenseContainer } from '~shared/lib/react-query/query-suspense-container';
import { ActivityStickerPicker } from '~widgets/activity/ui/fragments/activite-sticker-picker';

interface CommentsProps {
  query?: ActivityTargetQuerySchema;
  target: PublisherCommentTarget;
  canPinComment?: boolean;
}

export const PublisherComments = ({ query, target, canPinComment }: CommentsProps) => {
  const contentType = useContentType();
  const t = useTranslations('reusable.actions');

  const renderItem = useMemo(
    () => (data: CommentSchema, props) => (
      <ActivityBaseStateProvider>
        <ActivityItem data={data} {...props}>
          <ActivityItemActions.Provider>
            <ActivityItem.ContextConsumer>
              {({ data }) =>
                data.chapter ? (
                  <Link
                    prefetch={false}
                    href={Routing.Chapter.main({
                      params: {
                        id: data.chapter.id,
                        titleDir: data.title.dir,
                        content: contentType,
                      },
                      query: {
                        page: data.page,
                      },
                    })}
                  >
                    <TitleImage
                      alt={data.title.main_name}
                      src={data.title.cover.mid}
                      fill
                      priority
                      className="w-16 rounded-xs"
                    />
                  </Link>
                ) : data.title ? (
                  <Link
                    href={Routing.Title.detail({
                      params: {
                        dir: data.title.dir,
                        content: contentType,
                        tab: 'main',
                      },
                    })}
                  >
                    <TitleImage
                      alt={data.title.main_name}
                      src={data.title.cover.mid}
                      fill
                      priority
                      className="w-16 rounded-xs"
                    />
                  </Link>
                ) : (
                  <Link
                    href={Routing.User.detail({
                      params: { id: data.user.id, tab: 'about' },
                    })}
                  >
                    <UserAvatar
                      avatarSrc={data.user.avatar.mid}
                      alt={`${data.user.username}_avatar`}
                      className={cn('h-10 w-10')}
                    />
                  </Link>
                )
              }
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
                                  <DropdownMenuItem className="w-full py-1">
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
                                <ActivityItemActions.Edit asChild>
                                  <DropdownMenuItem className="w-full py-1">
                                    Редактировать
                                  </DropdownMenuItem>
                                </ActivityItemActions.Edit>
                                <ActivityItemActions.Delete asChild>
                                  <DropdownMenuItem className="w-full py-1">
                                    Удалить
                                  </DropdownMenuItem>
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
                                resetOnSubmit
                                className="my-2 w-full"
                                {...props}
                                closeOnSubmit
                              >
                                <ActivityForm.Content onSubmit={props.onSubmit}>
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
                <div className="ml-auto flex flex-row gap-0.5">
                  <ActivityItemActions.Like className="items-center" />
                  {/*<ActivityItemActions.Dislike className="items-center" />*/}
                </div>
              </ActivityItem.Footer>
            </div>
          </ActivityItemActions.Provider>
        </ActivityItem>
      </ActivityBaseStateProvider>
    ),
    []
  );

  return (
    // @ts-ignore
    <ActivityList value={{ queryFn: ActivityRepository.publisher, target, queryProp: query }}>
      <ActivityListActions.Provider>
        <ActivityListActions.OrderingTabs className="mb-4" />
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
  );
};
