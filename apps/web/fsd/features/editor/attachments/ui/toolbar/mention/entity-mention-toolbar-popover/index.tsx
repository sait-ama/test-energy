import { memo, Suspense, useEffect } from 'react';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

import { Popover, PopoverAnchor, PopoverContent } from '@re/ui-kit/ui/popover';

import { POST_ATTACHMENT_TYPE } from '~entities/post-attachment/model/const';
import { CUSTOM_CREATE_MENTION } from '~shared/ui/text-editor/commands';
import { useStrictContext } from '~shared/utils/use-strict-context';

import { MentionType } from '../../../../model/const';
import { MentionContext, MentionContextSchema, MentionProvider } from '../../../../model/store';
import { GuildMentionContent } from './guild-mention';
import { IndefiniteMentionContent } from './indefinite-mention';
import { PublisherMentionContent } from './publisher-mention';
import { UserMentionContent } from './user-mention';

const renderMentionPopoverContent = ({ type }: { type: MentionType | 'indefinite' }) => {
  switch (type) {
    case 'indefinite':
      return <IndefiniteMentionContent />;
    case POST_ATTACHMENT_TYPE.user:
      return <UserMentionContent />;
    case POST_ATTACHMENT_TYPE.club:
      return <GuildMentionContent />;
    case POST_ATTACHMENT_TYPE.publisher:
      return <PublisherMentionContent />;
    default:
      return null;
  }
};

export const EntityMentionPopoverInner = memo(() => {
  const [editor] = useLexicalComposerContext();
  const { mention, parsedMention, setMention } =
    useStrictContext<MentionContextSchema>(MentionContext);

  useEffect(() => {
    return editor.registerCommand(
      CUSTOM_CREATE_MENTION,
      (value) => {
        setMention(value);

        return false;
      },
      0
    );
  }, [editor]);

  const mentionPopoverView = parsedMention
    ? renderMentionPopoverContent({ type: parsedMention.type })
    : null;

  const isOpen = !!mention && !!mentionPopoverView;

  return (
    <Popover open={isOpen}>
      <PopoverAnchor asChild>
        <div className="absolute right-0 bottom-0 left-0 h-2 translate-y-full" />
      </PopoverAnchor>
      {mentionPopoverView ? (
        <PopoverContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="w-(--radix-popover-trigger-width) overflow-hidden p-0"
          align="center"
          side="bottom"
          avoidCollisions={false}
        >
          {mentionPopoverView}
        </PopoverContent>
      ) : null}
    </Popover>
  );
});

export const ToolbarEntityMentionPopover = memo(() => (
  <Suspense fallback={null}>
    <MentionProvider>
      <EntityMentionPopoverInner />
    </MentionProvider>
  </Suspense>
));
