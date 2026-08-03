import * as React from 'react';
import { memo, ReactNode } from 'react';

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@re/ui-kit/ui/dialog';
import { cn } from '@re/ui-kit/utils/cn';

import {
  MomentCardBackground,
  MomentCardDescription,
  MomentCardImage,
  MomentCardRoot,
  MomentCardSpoilerIndicator,
} from '~entities/moment/ui/moment-card';
import { LikeMoment } from '~features/like-moment/ui/like-moment';
import { RemoveMoment } from '~features/remove-moment/ui/remove-moment';
import type { Moment as MomentSchema } from '~shared/api/generated/models';
import { useSession } from '~shared/lib/session/use-session';
import { getAbbreviatedNumber } from '~shared/utils/get-abbreviated-number';
import { UrlFormatter } from '~shared/utils/url-formatter';

import { MomentPreview } from '../moment-preview';

export interface MomentItemProps {
  model: MomentSchema;
  className?: string;
  actions?: ReactNode;
}

export interface MomentCardProps {
  model: MomentSchema;
  className?: string;
  actions?: React.ReactNode;
}

export const MomentItem = memo((props: MomentItemProps) => {
  const { model, className, actions, ...rest } = props;
  return (
    <MomentCardRoot
      className={cn('border-border bg-card relative overflow-hidden rounded-md border', className, {
        'after:to-secondary dark:after:to-background after:absolute after:inset-0 after:size-full after:bg-gradient-to-b after:from-transparent after:from-70%':
          !!model.description,
        'opacity-[0.7]': model.is_deleted || model.is_banned,
      })}
      {...rest}
    >
      {model.is_spoiler ? <MomentCardSpoilerIndicator /> : null}
      <div
        className={cn('flex items-center justify-center', {
          'blur-lg': model.is_spoiler,
        })}
      >
        <MomentCardBackground src={UrlFormatter.media(model.image?.mid ?? '')} />
        <MomentCardImage src={model?.image?.mid ?? ''} />
        <MomentCardDescription className="absolute bottom-0 left-0 px-4 pb-2" lineClamp={2}>
          {model.description}
        </MomentCardDescription>
        {actions}
      </div>
    </MomentCardRoot>
  );
});

export interface MomentItemWithPreviewProps {
  model: MomentSchema;
}

export const MomentItemWithPreviewModal = (props: MomentItemWithPreviewProps) => {
  const { model } = props;

  const sessionId = useSession((v) => v?.id);
  const isStaff = useSession((v) => v?.is_staff);
  const hasAbility2Remove = sessionId === model?.author?.id || isStaff;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <MomentItem
          model={model}
          className="cursor-pointer"
          // actions={<LikeMoment model={model} />}
        />
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-2 border-0 bg-transparent p-0 max-sm:p-4 sm:max-w-[800px]">
        <DialogTitle className="sr-only">Превью момента</DialogTitle>
        <MomentPreview
          model={model}
          actions={
            <span className="flex items-center gap-2">
              <LikeMoment className="h-9" model={model}>
                {(score) => getAbbreviatedNumber(score)}
              </LikeMoment>
              {hasAbility2Remove ? <RemoveMoment model={model} /> : null}
            </span>
          }
        />
      </DialogContent>
    </Dialog>
  );
};
