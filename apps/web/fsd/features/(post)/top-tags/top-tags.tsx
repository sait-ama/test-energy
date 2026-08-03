import type { PropsWithChildren } from 'react';
import Link from 'next/link';

import { useSuspenseQuery } from '@tanstack/react-query';

import { forumTagsWeekListOptions } from '@re/api/generated/@tanstack/react-query.gen';
import Cards from '@re/ui-kit/icons/cards';
import { textVariants } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { client } from '~shared/api/client';
import { Routing } from '~shared/config/routing';
import { linkBaseVariants } from '~shared/ui/link-base';
import { Section, SectionContent, SectionTitle } from '~shared/ui/section';

export const TopTagsTitle = () => {
  return <SectionTitle className="mb-2">Темы недели</SectionTitle>;
};
export const TopTagsRoot = ({ children }: PropsWithChildren) => (
  <Section withBorder={false} className="dark:bg-card gap-2">
    {children}
  </Section>
);
export const TopTagsContent = ({
  children,
  className,
}: PropsWithChildren & { className?: string }) => (
  <SectionContent className={className}>{children}</SectionContent>
);
export const TopTags = () => {
  const { data: tags = [] } = useSuspenseQuery(forumTagsWeekListOptions({ client }));

  return (
    <TopTagsRoot>
      <TopTagsTitle />
      <TopTagsContent className="flex flex-col gap-3">
        {tags.map((it, idx) => (
          <span key={it.id} className="flex flex-nowrap items-center justify-between gap-2">
            <span className="flex items-center gap-3">
              {/*<ReText size="xs" className="bg-secondary flex h-6 w-6 items-center justify-center rounded-full">*/}
              {/*  {idx + 1}*/}
              {/*</ReText>*/}
              <div className="flex size-6 items-center justify-center">
                <Cards className="size-5" />
              </div>

              <Link
                prefetch={false}
                href={Routing.Forum.Feed.get({ query: { tags: [it.id] } })}
                className={cn(
                  linkBaseVariants(),
                  textVariants({ className: 'flex items-center gap-2' })
                )}
              >
                {it.name}
                {/*<ExternalLink className="size-4" />*/}
              </Link>
            </span>
            {/*<ReText size="sm" color="muted-foreground">*/}
            {/*    500*/}
            {/*</ReText>*/}
          </span>
        ))}
      </TopTagsContent>
    </TopTagsRoot>
  );
};
