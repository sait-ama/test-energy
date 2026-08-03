import { ComponentPropsWithoutRef, memo, useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'use-intl';

import { ClubDetail, UserDetail } from '@re/api/generated/types.gen';
import ChevronRightIcon from '@re/ui-kit/icons/chevron-right';
import { CloseIcon } from '@re/ui-kit/icons/close';
import { Avatar, AvatarFallback, AvatarImage } from '@re/ui-kit/ui/avatar';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import { POST_ATTACHMENT_TYPE } from '~entities/post-attachment/model/const';
import { HorizontalUserCard } from '~entities/user/ui/horizontal-user-card';
import { UserAvatar } from '~entities/user/ui/user-avatar';
import { MentionContext, MentionContextSchema } from '~features/editor/attachments/model/store';
import { client } from '~shared/api/client';
import { v2ClubsRetrieveOptions } from '~shared/api/generated/tanstack';
import { useSession } from '~shared/lib/session/use-session';
import type { FlatListType } from '~shared/ui/flat-list-v2';
import { FlatList as _FlatList } from '~shared/ui/flat-list-v2';
import { UrlFormatter } from '~shared/utils/url-formatter';
import { useStrictContext } from '~shared/utils/use-strict-context';

const UserCard = ({ model, ...rest }: { model: UserDetail }) => {
  const { handleSubmit } = useStrictContext<MentionContextSchema>(MentionContext);

  const handleClick = async () => {
    handleSubmit(POST_ATTACHMENT_TYPE.user, String(model.id), model);
  };

  return (
    <div
      className="hover:bg-muted flex cursor-pointer items-center justify-between rounded-md px-3 py-2"
      onClick={handleClick}
    >
      <div className="flex items-center gap-4">
        <UserAvatar
          size="xs"
          withFrameMargin
          frameSrc={model?.frame?.high}
          avatarSrc={model?.avatar?.mid}
          alt="alt"
        />
        <ReText size="sm" lineClamp={1} className="break-all" weight="semibold">
          {model?.username}
        </ReText>
      </div>

      <ReText
        color="muted-foreground"
        size="sm"
        lineClamp={1}
        className="break-all"
        weight="medium"
      >
        @{model.id}
      </ReText>
    </div>
  );
};

interface ClubCardProps extends ComponentPropsWithoutRef<'div'> {
  model: Pick<ClubDetail, 'avatar' | 'name' | 'id'>;
}

const ClubCard = ({ model, onClick }: ClubCardProps) => {
  return (
    <div
      className="hover:bg-muted flex cursor-pointer items-center justify-between rounded-md px-3 py-2"
      onClick={onClick}
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

      <Button circle color="muted" variant="ghost">
        <ChevronRightIcon />
      </Button>
    </div>
  );
};

interface ClubMembersListProps {
  dir: string;
  onClose: () => void;
}

const ClubMembersList = (props: ClubMembersListProps) => {
  const { dir, onClose } = props;
  const t = useTranslations('reusable.empty_states');
  const { data: clubsData, isLoading } = useQuery(
    v2ClubsRetrieveOptions({ client, path: { dir } })
  );

  const members = useMemo(() => clubsData?.members || [], [clubsData]);

  const FlatList: FlatListType<typeof members> = _FlatList;

  return (
    <div>
      <Button color="muted" onClick={onClose} endIcon={<CloseIcon />}>
        {clubsData?.name}
      </Button>
      <FlatList.Root className="mt-2 w-full" content={members} isLoading={isLoading}>
        <FlatList.Layout className="grid grid-cols-1 gap-2">
          <FlatList.Content>
            {({ item: item, index }) => (
              <UserCard
                key={`${item.user.id}-${index}`}
                model={item.user}
                className="h-full w-full"
              />
            )}
          </FlatList.Content>
          <FlatList.Loading count={10}>
            {({ key }) => <HorizontalUserCard isLoading model={null} key={key} />}
          </FlatList.Loading>
          <FlatList.Empty
            className="col-span-full opacity-70"
            height="40vh"
            isEmpty
            text={t('empty')}
            emoji="ඞ"
          />
        </FlatList.Layout>
      </FlatList.Root>
    </div>
  );
};

interface ClubListProps {
  onChoose: (dir: string) => void;
}

const ClubList = ({ onChoose }: ClubListProps) => {
  const session = useSession();

  const clubs = session?.clubs || [];
  const t = useTranslations('reusable.empty_states');
  const FlatList: FlatListType<typeof clubs> = _FlatList;

  return (
    <FlatList.Root className="w-full" content={clubs}>
      <FlatList.Layout className="grid grid-cols-1 gap-2">
        <FlatList.Content>
          {({ item: item }) => (
            <ClubCard
              onClick={() => onChoose(item.dir)}
              key={item.id}
              model={item}
              className="h-full w-full"
            />
          )}
        </FlatList.Content>
        <FlatList.Loading count={10}>
          {({ key }) => <HorizontalUserCard isLoading model={null} key={key} />}
        </FlatList.Loading>
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

export const ClubMembersTab = memo(() => {
  const [dir, setDir] = useState<string | null>(null);
  const [direction, setDirection] = useState<'forward' | 'backward' | null>('backward');

  const slideVariants = {
    forward: {
      initial: { x: '100%', opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: '100%', opacity: 0 },
    },
    backward: {
      initial: { x: '-100%', opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: '-100%', opacity: 0 },
    },
  };

  const content = dir ? (
    <ClubMembersList
      dir={dir}
      onClose={() => {
        setDir(null);
        setDirection('backward');
      }}
    />
  ) : (
    <ClubList
      onChoose={(dir) => {
        setDir(dir);
        setDirection('forward');
      }}
    />
  );

  const currentVariant = direction === 'backward' ? slideVariants.backward : slideVariants.forward;

  return (
    <AnimatePresence initial={false} mode="popLayout">
      <motion.div
        key={dir}
        initial={currentVariant.initial}
        animate={currentVariant.animate}
        exit={currentVariant.exit}
        transition={{
          ease: 'easeInOut',
          duration: 0.225,
        }}
        className="flex h-full max-h-full w-full flex-col"
      >
        {content}
      </motion.div>
    </AnimatePresence>
  );
});
