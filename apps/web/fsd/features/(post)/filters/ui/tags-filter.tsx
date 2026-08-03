'use client';
import { useSuspenseQuery } from '@tanstack/react-query';

import { v2ForumTagsRetrieveOptions } from '@re/api/generated/@tanstack/react-query.gen';
import Close from '@re/ui-kit/icons/close';
import { Button } from '@re/ui-kit/ui/button';
import { CustomScrollArea } from '@re/ui-kit/ui/custom-scroll-area';
import { cn } from '@re/ui-kit/utils/cn';

import { useForumTags } from '~entities/post/model/contexts';
import { client } from '~shared/api/client';
import { TagSchema } from '~shared/api/models/tagSchema';

export const TagsFilter = () => {
  const { data } = useSuspenseQuery(
    v2ForumTagsRetrieveOptions({
      client,
      query: { count: 200, page: 1 },
      cache: 'force-cache',
      next: { revalidate: 60 * 60 * 6, tags: ['forum-tags-filters'] },
    })
  );

  const toggle = useForumTags((v) => v.toggle);
  const includes = useForumTags((v) => v.includes);
  const excludes = useForumTags((v) => v.excludes);

  const renderContent = ({ description, id, name }: TagSchema, shouldBlock?: boolean) => {
    const isActive = includes.includes(id);
    const isExclude = excludes.includes(id);

    const handleClick = (e: React.MouseEvent) => {
      if (shouldBlock) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      toggle(id);
    };

    const showIcon = isActive || isExclude;
    return (
      <Button
        onClick={handleClick}
        variant="flat"
        color={isActive ? 'primary' : isExclude ? 'danger' : 'default'}
        key={id}
        aria-label={description}
        className={cn('h-8 overflow-hidden', { '!pr-0': showIcon })}
      >
        {name}
        {showIcon ? (
          <span
            className={cn(
              'ml-2 flex aspect-square size-8 items-center justify-center rounded-full bg-transparent transition-colors',
              {
                'hover:text-destructive-foreground hover:bg-destructive/50': isExclude,
                // 'text-danger hover:bg-danger/50': isActive,
              }
            )}
          >
            <Close className="size-5" />
          </span>
        ) : null}
      </Button>
    );
  };

  return (
    <CustomScrollArea
      inertiaStrength={0.85}
      className="border-border bg-card flex h-10 w-full items-center gap-1 rounded-md border p-0 pl-1"
      orientation="horizontal"
    >
      {({ shouldBlockInteractions }) => (
        <div className="flex h-10 items-center gap-2">
          {data.results.map((v) => renderContent(v, shouldBlockInteractions))}
        </div>
      )}
    </CustomScrollArea>
  );
};
