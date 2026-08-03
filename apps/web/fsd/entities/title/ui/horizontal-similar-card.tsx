import { ComponentProps, memo, MouseEventHandler, ReactNode } from 'react';
import Link from 'next/link';

import Add from '@re/ui-kit/icons/add';
import Remove from '@re/ui-kit/icons/remove';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useContentType } from '~app/providers/site-config-provider';
import { similarityCriteria } from '~entities/title/model/consts';
import { useScoreSimilarTitle } from '~entities/title/model/mutations';
import { TitleImage } from '~entities/title/ui/title-image';
import type { SimilarTitle } from '~shared/api/models/title';
import { Routing } from '~shared/config/routing';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { useLoggedCheck } from '~shared/lib/session/use-logged';
import { importToastAsync } from '~shared/ui/toast/toast.async';

interface ActionButtonProps {
  type: number;
  titleDir: string;
  similarDir: string;
  rated: number | null;
}

export const ActionButton = (props: ActionButtonProps) => {
  const { type, titleDir, similarDir, rated } = props;

  const checkLogged = useLoggedCheck();

  const { mutateAsync } = useScoreSimilarTitle({
    params: {
      dir: titleDir,
    },
  });

  const handleSetSimilar = async () => {
    const toast = await importToastAsync();
    try {
      await mutateAsync({
        vote_type: type as 0 | 1,
        title1_dir: titleDir,
        title2_dir: similarDir,
      });
      toast.success('Оценка успешно поставлена');
    } catch (e: unknown) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  const handleClick: MouseEventHandler<HTMLSpanElement> = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    checkLogged(handleSetSimilar)();
  };

  const Component = type === 1 ? Remove : Add;

  return (
    <button
      onClickCapture={handleClick}
      className={cn(
        'bg-secondary text-secondary-foreground flex h-6 w-6 items-center justify-center rounded-sm hover:opacity-85 active:scale-[0.95]',
        {
          'text-destructive': type === 1,
          'text-primary': type === 0,
          'bg-destructive text-destructive-foreground': rated === type && type === 1,
          'bg-primary text-primary-foreground': rated === type && type === 0,
        }
      )}
    >
      <Component className="size-4" />
    </button>
  );
};

interface HorizontalSimilarCardProps extends ComponentProps<'a'> {
  model: SimilarTitle;
  renderAction?: ({
    type,
    similarDir,
    rated,
  }: {
    type: number;
    rated: number | null;
    similarDir: string;
  }) => ReactNode;
  isLoading?: boolean;
}

export const HorizontalSimilarCard = memo((props: HorizontalSimilarCardProps) => {
  const { model, isLoading, renderAction, ...rest } = props;
  const contentType = useContentType();

  const similarityParameters = similarityCriteria
    .map(({ key, value }) => (model[key] ? value : null))
    .filter((t) => typeof t === 'string')
    .slice(0, 2);

  return (
    <Link
      prefetch={false}
      href={Routing.Title.detail({
        params: {
          dir: model.title.dir,
          content: contentType,
          tab: Routing.Title.TitleDetailTabs.MAIN,
        },
      })}
      {...rest}
    >
      <div className="flex items-center gap-3">
        <TitleImage alt={model.title.main_name} src={model.title.cover.mid} size={105} />

        <div className="flex flex-col justify-between gap-2">
          <div className="space-y-1">
            <ReText size="sm" weight="bold" lineClamp={2}>
              {model.title.main_name}
            </ReText>
            {similarityParameters.length ? (
              <ReText size="xs" color="muted-foreground" lineClamp={2}>
                Похож по {similarityParameters.join(', ')}
              </ReText>
            ) : null}
          </div>
          <div className="flex items-center">
            {!isLoading && renderAction
              ? renderAction({
                  type: 0,
                  similarDir: model.title.dir,
                  rated: model?.rated,
                })
              : null}
            <ReText className="px-3" size="xs" color="muted-foreground">
              {model.score ?? 0}
            </ReText>
            {!isLoading && renderAction
              ? renderAction({
                  type: 1,
                  similarDir: model.title.dir,
                  rated: model?.rated,
                })
              : null}
          </div>
        </div>
      </div>
    </Link>
  );
});
