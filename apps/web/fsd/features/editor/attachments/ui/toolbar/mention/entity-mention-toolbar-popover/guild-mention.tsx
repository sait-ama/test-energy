import { ComponentPropsWithoutRef, memo } from 'react';
import { useTranslations } from 'next-intl';

import { ClubDetail } from '@re/api/generated/types.gen';
import CloseIcon from '@re/ui-kit/icons/close';
import { Avatar, AvatarFallback, AvatarImage } from '@re/ui-kit/ui/avatar';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import { POST_ATTACHMENT_TYPE } from '~entities/post-attachment/model/const';
import { MentionContext, MentionContextSchema } from '~features/editor/attachments/model/store';
import { useSession } from '~shared/lib/session/use-session';
import { FlatList as _FlatList, FlatListType } from '~shared/ui/flat-list-v2';
import { UrlFormatter } from '~shared/utils/url-formatter';
import { useStrictContext } from '~shared/utils/use-strict-context';

interface ClubCardProps extends ComponentPropsWithoutRef<'div'> {
  model: Pick<ClubDetail, 'avatar' | 'name' | 'id'>;
}

const ClubCard = ({ model }: ClubCardProps) => {
  const { handleSubmit } = useStrictContext<MentionContextSchema>(MentionContext);

  const handleClick = async () => {
    handleSubmit(POST_ATTACHMENT_TYPE.club, String(model.id), model);
  };

  return (
    <div
      className="hover:bg-muted flex cursor-pointer items-center justify-between rounded-md px-3 py-2"
      onClick={handleClick}
    >
      <div className="flex items-center gap-4">
        <Avatar
          src={UrlFormatter.media(model?.avatar?.mid || '')}
          className="aspect-square overflow-hidden rounded-sm select-none"
          style={{ width: 40, height: 40 }}
        >
          <AvatarImage alt={model?.name || ''} width={40} height={40} className="rounded-sm" />
          <AvatarFallback>{model?.name}</AvatarFallback>
        </Avatar>
        <ReText size="sm" lineClamp={1} className="break-all" weight="semibold">
          {model.name}
        </ReText>
      </div>
    </div>
  );
};

const ClubList = () => {
  const t = useTranslations('reusable.empty_states');
  const session = useSession();

  const clubs = session?.clubs || [];

  const FlatList: FlatListType<typeof clubs> = _FlatList;

  return (
    <FlatList.Root className="w-full" content={clubs}>
      <FlatList.Layout className="grid grid-cols-1 gap-2">
        <FlatList.Content>
          {({ item: item }) => <ClubCard key={item.id} model={item} className="h-full w-full" />}
        </FlatList.Content>
        <FlatList.Loading count={10}>{({ key }) => null}</FlatList.Loading>
        <FlatList.Empty
          className="col-span-full opacity-70"
          height="40vh"
          isEmpty
          text={t('empty')}
          emoji="ඞ"
        />
      </FlatList.Layout>
    </FlatList.Root>
  );
};

export const GuildMentionContent = memo(() => {
  const t = useTranslations('mention-popover.guild');
  const { setMention } = useStrictContext<MentionContextSchema>(MentionContext);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <ReText>{t('label')}</ReText>
        <Button color="muted" circle size="sm" onClick={() => setMention(null)}>
          <CloseIcon />
        </Button>
      </div>
      <ClubList />
    </div>
  );
});
