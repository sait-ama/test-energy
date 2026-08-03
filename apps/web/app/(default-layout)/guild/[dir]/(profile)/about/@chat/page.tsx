'use client';

import { memo } from 'react';

import Close from '@re/ui-kit/icons/close';
import { Button } from '@re/ui-kit/ui/button';
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogPrimitive,
  DialogTitle,
  DialogTrigger,
} from '@re/ui-kit/ui/dialog';
import { cn } from '@re/ui-kit/utils/cn';
import { GuildChatAppAsync } from 'module/chat/GuildChatApp.async';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { isHasRole } from '~entities/guild/lib/access';
import { useGuildMemberRole, useGuildQuery } from '~entities/guild/model/hooks';
import { Features } from '~shared/config/feature-flags';
import { Section, SectionContent, SectionTitle } from '~shared/ui/section';

const ChatDialog = memo(() => {
  const { data: club, isLoading } = useGuildQuery();

  const siteConfig = useSiteConfig();

  if (siteConfig.features[Features.SHORTS]) return null;

  return (
    <Dialog>
      <DialogTrigger asChild disabled={isLoading}>
        <Button>Открыть чат</Button>
      </DialogTrigger>
      <DialogPortal data-slot="dialog-portal">
        <DialogOverlay>
          <DialogPrimitive.Content
            data-slot="dialog-content"
            // onEscapeKeyDown={(e) => e.preventDefault()}
            onPointerDownOutside={(e) => e.preventDefault()}
            className={cn(
              'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 relative top-[50%] left-[50%] z-50 max-h-[100dvh] w-full max-w-screen translate-x-[-50%] translate-y-[-50%] shadow-lg duration-200 md:max-w-[calc(100%-2rem)]',
              'border-border h-[100dvh] w-screen p-0 md:h-[calc(100vh-48px)] md:w-[700px]'
            )}
          >
            <DialogTitle className="sr-only">Чат Гильдии</DialogTitle>
            <DialogPrimitive.Close
              asChild
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-[12px] right-[12px] z-100 opacity-70 transition-opacity hover:opacity-100 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none sm:top-[-13px] sm:right-[-15px]"
            >
              <Button variant="secondary" circle className="rounded-full">
                <Close className="size-4" />
              </Button>
            </DialogPrimitive.Close>
            <GuildChatAppAsync club={club!} />
          </DialogPrimitive.Content>
        </DialogOverlay>
      </DialogPortal>
    </Dialog>
  );
});

export default function ChatSegment() {
  const role = useGuildMemberRole();

  if (isHasRole(role)) return null;

  return (
    <Section>
      <SectionTitle>Чат Гильдии</SectionTitle>
      <SectionContent className="">
        <ChatDialog />
      </SectionContent>
    </Section>
  );
}

export const dynamic = 'force-dynamic';
