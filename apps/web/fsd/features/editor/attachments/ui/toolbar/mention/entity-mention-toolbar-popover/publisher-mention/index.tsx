import { memo } from 'react';
import { useTranslations } from 'next-intl';

import { v2PublishersRetrieve2 } from '@re/api/generated/sdk.gen';
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

import { UserPublishersTab } from './user-publishers-tab';

const PublisherSearchButton = () => {
  const t = useTranslations('form.placeholders');
  const { handleSubmit } = useStrictContext<MentionContextSchema>(MentionContext);
  const { open: openSearchModal } = useSearchModal();

  const handleOpen = () => {
    // @ts-ignore
    openSearchModal({
      onClick: (value: SearchItem<SearchField.publishers>) => {
        handleSubmit(POST_ATTACHMENT_TYPE.publisher, String(value.id), value);
      },
      hits: false,
      history: false,
      fields: [SearchField.publishers],
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
      {t('search')}
    </Button>
  );
};

const PublisherIdHint = () => {
  const t = useTranslations('mention-popover');

  const { parsedMention, handleSubmit } = useStrictContext<MentionContextSchema>(MentionContext);

  const id = parsedMention!.id!;

  const handleClick = async () => {
    const toast = await importToastAsync();
    try {
      const publisher = await v2PublishersRetrieve2({
        client,
        path: { publisher_dir: id as string },
      });
      handleSubmit(POST_ATTACHMENT_TYPE.publisher, String(publisher.data.id), publisher);
    } catch {
      toast.error(t('publisher.hint-error-message', { dir: id }));
    }
  };

  if (!id) {
    return (
      <ReText color="muted-foreground" size="xs" className="flex h-7.5 items-center">
        {t('publisher.hint-text', { example: '@publisher_rebots' })}
      </ReText>
    );
  }

  return (
    <Button variant="link" size="sm" onClick={handleClick}>
      {t('publisher.hint-active-text', { text: `dir:${parsedMention!.id}` })}
    </Button>
  );
};

export const PublisherMentionContent = memo(() => {
  const t = useTranslations('mention-popover');

  const { setMention } = useStrictContext<MentionContextSchema>(MentionContext);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <ReText>{t('publisher.label')}</ReText>
        <Button color="muted" circle size="sm" onClick={() => setMention(null)}>
          <CloseIcon />
        </Button>
      </div>
      <TabsSecondary.Root defaultValue="user-publishers" className="mt-3">
        <ScrollArea>
          <div className="pb-2">
            <TabsSecondary.List variant="secondary" size="xs">
              <PublisherSearchButton />
              <span className="border-l-muted h-full w-[1px] border-x"></span>
              <TabsSecondary.Trigger value="user-publishers">
                {t('publisher.tabs.user-publishers')}
              </TabsSecondary.Trigger>
            </TabsSecondary.List>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <PublisherIdHint />

        <ScrollArea>
          <div style={{ maxHeight: 'calc(var(--radix-popover-content-available-height) - 10vh)' }}>
            <TabsSecondary.Content value="user-publishers">
              <UserPublishersTab />
            </TabsSecondary.Content>
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </TabsSecondary.Root>
    </div>
  );
});
