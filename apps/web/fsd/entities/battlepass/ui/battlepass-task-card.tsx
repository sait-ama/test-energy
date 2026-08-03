import { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Progress } from '@re/ui-kit/ui/progress';
import { ReText } from '@re/ui-kit/ui/text';

import { game2Link, RECURSIVE_TASKS_TYPES } from '~entities/battlepass/model/const';
import type { BattlePassTask } from '~shared/api/models/battlepass';
import { linkBaseVariants } from '~shared/ui/link-base';
import { NoSSR } from '~shared/ui/no-ssr';
import { UrlFormatter } from '~shared/utils/url-formatter';

interface TaskCardProps {
  model: BattlePassTask;
  action: ReactNode;
}

export const TaskCard = (props: TaskCardProps) => {
  const { model, action } = props;

  const { name, description, event, refresh, goal, reward, progress, image } = model;
  const t = useTranslations('battlepass.tasks');
  const isMinigame = Object.keys(game2Link).includes(model.event.toString());

  return (
    <div className="border-border flex flex-col justify-between gap-4 rounded-md border p-4">
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Image
            width={90}
            height={135}
            className="rounded-md object-contain"
            src={UrlFormatter.media(image) ?? ''}
            alt="Картинка задачи"
          />
          <div className="flex w-full flex-col gap-2">
            <ReText size="lg" weight="bold" component="span">
              {name}
            </ReText>
            <div className="flex w-full items-center gap-2">
              <Progress value={(100 * progress) / goal} className="w-full" />
              <ReText
                size="sm"
                className="whitespace-nowrap"
                color="muted-foreground"
                component="span"
              >
                {progress} / {goal}
              </ReText>
            </div>
            {/*// @ts-ignore*/}
            {RECURSIVE_TASKS_TYPES.includes(refresh) ? (
              <ReText color="muted-foreground" component="span">
                {t.rich('refresh-by', {
                  interval: refresh,
                  span: (children) => <span className="text-foreground">{children}</span>,
                })}
              </ReText>
            ) : null}
          </div>
        </div>

        <NoSSR>
          <ReText
            color="muted-foreground"
            component="span"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </NoSSR>
        {isMinigame ? (
          <ReText color="muted-foreground" component="span">
            {t.rich('minigame-link', {
              event,
              link: (children) => (
                <Link target="_blank" className={linkBaseVariants()} href={game2Link[event]}>
                  {children}
                </Link>
              ),
            })}
          </ReText>
        ) : null}
      </div>

      <div className="flex w-full items-center justify-between">
        <ReText className="flex items-center gap-2" component="span">
          <div className="bg-primary h-[6px] w-[12px] rounded-full" />
          {t.rich('exp-amount', {
            exp: reward,
            span: (children) => <span className="text-primary">{children}</span>,
          })}
        </ReText>
        {action}
      </div>
    </div>
  );
};
