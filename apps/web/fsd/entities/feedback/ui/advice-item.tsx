import type { ComponentProps } from 'react';

import dayjs from 'dayjs';

import Heart from '@re/ui-kit/icons/heart';
import HeartContained from '@re/ui-kit/icons/heart-contained';
import { Button } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

import { useSiteConfig } from '~app/providers/site-config-provider';
import type { UserFeedback } from '~shared/api/models/panel';

export interface AdviceItemProps extends ComponentProps<'div'> {
  model: UserFeedback;
}

export const AdviceItem = (props: AdviceItemProps) => {
  const { model } = props;
  const longDateFormat = useSiteConfig((v) => v.localization.longDateFormat);

  return (
    <div className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-800/50 p-6 transition-all hover:border-gray-700 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-xl font-semibold text-gray-100">{model.topic}</h3>
            {/*{isHot && (*/}
            {/*    <Badge color="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20">*/}
            {/*        <Sparkles className="h-3 w-3 mr-1" /> Hot*/}
            {/*    </Badge>*/}
            {/*)}*/}
          </div>
          <p className="text-gray-400">{model.description}</p>
          <div className="mt-2 text-sm text-gray-500">
            Добавлено {dayjs(model.created_at).format(longDateFormat)}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'transition-all hover:scale-105',
              model.rated === 0 && 'border-green-500/30 bg-green-500/20 text-green-400'
            )}
            onClick={() => {}}
          >
            <Heart className="mr-2 size-4" />
          </Button>
          {model.score}

          <Button
            variant="outline"
            size="sm"
            className={cn(
              'transition-all hover:scale-105',
              model.rated === 'dislike' && 'border-red-500/30 bg-red-500/20 text-red-400'
            )}
            onClick={() => {}}
          >
            <HeartContained className="mr-2 size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
