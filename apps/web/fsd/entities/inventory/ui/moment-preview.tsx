'use client';
import React, { ReactNode, Suspense, useState } from 'react';

import ExternalLink from '@re/ui-kit/icons/external-link';
import Report from '@re/ui-kit/icons/report';
import { Button } from '@re/ui-kit/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@re/ui-kit/ui/dialog';
import { cn } from '@re/ui-kit/utils/cn';

import {
  MomentCardAuthor,
  MomentCardBackground,
  MomentCardChapter,
  MomentCardDescription,
  MomentCardImage,
  MomentCardTags,
  MomentCardTitle,
} from '~entities/moment/ui/moment-card';
import { ReportModalAsync } from '~entities/report/ui/report.async';
import { MomentShare } from '~features/(moments)/moment-share';
import { MomentSchema } from '~shared/api/models/inventory';
import { TestProps } from '~shared/lib/test/utils/test-props';
import { UrlFormatter } from '~shared/utils/url-formatter';
import { CommentsAsync } from '~widgets/activity/ui/comments.async';

export interface MomentPreviewProps {
  model: MomentSchema;
  className?: string;
  actions?: ReactNode;
}

export const MomentPreview = (props: MomentPreviewProps) => {
  const { model, className, actions, ...rest } = props;

  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          'bg-background border-border flex flex-col gap-4 overflow-hidden rounded-md border p-6',
          className
        )}
        {...rest}
      >
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogTrigger asChild>
            <div className="bg-background relative overflow-hidden rounded-md">
              <MomentCardBackground src={UrlFormatter.media(model.image?.high ?? '')} />
              <MomentCardImage src={model?.image?.high ?? ''} />
              <Button circle variant="secondary" className="absolute right-2 bottom-2">
                <ExternalLink className="size-4" />
              </Button>
            </div>
          </DialogTrigger>
          <DialogContent className="w-full rounded-md border-none bg-transparent p-0 sm:max-w-2xl">
            <DialogTitle className="sr-only">Изображение момента</DialogTitle>
            <MomentCardImage
              className="mx-auto h-auto w-full max-w-[90%] [image-rendering:auto]"
              src={model.image?.high ?? ''}
            />
          </DialogContent>
        </Dialog>

        <div className="flex flex-col gap-4">
          <MomentCardTags className="-mx-2" model={model} />
          <div className="flex flex-col">
            <div className="flex justify-between">
              <MomentCardTitle model={model} />
              <MomentCardChapter model={model} />
            </div>
            <div className="flex w-full flex-col items-center justify-center gap-3 sm:items-stretch">
              <MomentCardDescription style={{ fontSize: 14 }} className="text-muted-foreground">
                {model.description}
              </MomentCardDescription>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <MomentShare model={model} size="default" circle={false} className="gap-2">
              Поделиться
            </MomentShare>
            <MomentCardAuthor model={model} />
            <Suspense>
              <ReportModalAsync type="moment" target={model.id}>
                <Button circle color="secondary">
                  <Report className="size-4" />
                </Button>
              </ReportModalAsync>
            </Suspense>
          </div>
          {actions}
        </div>
      </div>
      <div className="bg-background border-border overflow-hidden rounded-md border p-6 py-4">
        <CommentsAsync target={{ moment_id: model.id }} {...TestProps.id('moment-comments')} />
      </div>
    </>
  );
};
