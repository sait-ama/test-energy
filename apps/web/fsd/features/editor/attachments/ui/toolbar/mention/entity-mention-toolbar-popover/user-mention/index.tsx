import { memo } from 'react';
import { useTranslations } from 'next-intl';

import { v2UsersRetrieve } from '@re/api/generated/sdk.gen';
import CloseIcon from '@re/ui-kit/icons/close';
import { SearchIcon } from '@re/ui-kit/icons/search';
import { Button } from '@re/ui-kit/ui/button';
import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';
import { TabsSecondary } from '@re/ui-kit/ui/tabs-secondary';
import { ReText } from '@re/ui-kit/ui/text';

import { POST_ATTACHMENT_TYPE } from '~entities/post-attachment/model/const';
import { client } from '~shared/api/client';
import { SearchField, SearchItem } from '~shared/api/models/search';
import {
  PaginationMode as SEARCH_MODAL_PAGINATION_MODE,
  useSearchModal,
} from '~shared/lib/search/use-search-modal';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { useStrictContext } from '~shared/utils/use-strict-context';

import { MentionContext, MentionContextSchema } from '../../../../../model/store';

import { ClubMembersTab } from './club-members-tab';
import { FriendsTab } from './friends-tab';

const UserSearchButton = () => {
  const tForm = useTranslations('form');
  const { handleSubmit } = useStrictContext<MentionContextSchema>(MentionContext);
  const { open: openSearchModal } = useSearchModal();

  const handleOpen = () => {
    // @ts-ignore
    openSearchModal({
      onClick: (value: SearchItem<SearchField.users>) => {
        handleSubmit(POST_ATTACHMENT_TYPE.user, String(value.id), value);
      },
      hits: false,
      history: false,
      fields: [SearchField.users],
      paginationMode: SEARCH_MODAL_PAGINATION_MODE.LOAD_MORE,
    });
  };

  return (
    <Button
      startIcon={<SearchIcon />}
      color="muted"
      className="h-8"
      size="default"
      onClick={handleOpen}
    >
      {tForm('placeholders.search')}
    </Button>
  );
};

const UserIdHint = () => {
  const { parsedMention, handleSubmit } = useStrictContext<MentionContextSchema>(MentionContext);
  const t = useTranslations('mention-popover');

  const id = parsedMention!.id!;

  const handleClick = async () => {
    const toast = await importToastAsync();
    try {
      const user = await v2UsersRetrieve({ client, path: { user_id: id as number } });
      handleSubmit(POST_ATTACHMENT_TYPE.user, user.data.id, user);
    } catch {
      toast.error(t('user.hint-error-message', { id }));
    }
  };

  if (!id) {
    return (
      <ReText color="muted-foreground" size="xs" className="flex h-7.5 items-center">
        {t('user.hint-text', { example: '@user_123' })}
      </ReText>
    );
  }

  return (
    <Button variant="link" size="sm" onClick={handleClick}>
      {t('user.hint-active-text', { example: `id${parsedMention!.id}` })}
    </Button>
  );
};

export const UserMentionContent = memo(() => {
  const t = useTranslations('mention-popover');
  const { setMention } = useStrictContext<MentionContextSchema>(MentionContext);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <ReText>{t('user.label')}</ReText>
        <Button color="muted" circle size="sm" onClick={() => setMention(null)}>
          <CloseIcon />
        </Button>
      </div>
      <TabsSecondary.Root defaultValue="friends" className="mt-3">
        <ScrollArea>
          <div className="pb-2">
            <TabsSecondary.List variant="secondary" size="xs">
              <UserSearchButton />
              <span className="border-l-muted h-full w-[1px] border-x"></span>
              <TabsSecondary.Trigger value="friends">
                {t('user.tabs.friends')}
              </TabsSecondary.Trigger>
              {/* <TabsSecondary.Trigger value="recent">Недавние</TabsSecondary.Trigger> */}
              <TabsSecondary.Trigger value="guild-members">
                {t('user.tabs.guild-members')}
              </TabsSecondary.Trigger>
            </TabsSecondary.List>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <UserIdHint />

        <ScrollArea>
          <div className="max-h-[60vh]">
            <TabsSecondary.Content value="friends">
              <FriendsTab />
            </TabsSecondary.Content>
            <TabsSecondary.Content value="guild-members">
              <ClubMembersTab />
            </TabsSecondary.Content>
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </TabsSecondary.Root>
    </div>
  );
});
