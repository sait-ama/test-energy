import Image from 'next/image';

import { Progress } from '@re/ui-kit/ui/progress';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import type { UserAchievementSchema } from '~shared/api/models/user';
import { UrlFormatter } from '~shared/utils/url-formatter';

interface ContentProps {
  achievement: UserAchievementSchema;
  className?: string;
}

export const AchievementCardPreview = ({ achievement, className }: ContentProps) => {
  const progress = achievement.next ? achievement.progress : achievement.current?.goal;
  const goal = achievement.next ? achievement.next.goal : achievement.current?.goal;
  const progressProportion = achievement.next ? achievement.progress / achievement.next.goal : 1;

  return (
    <div className={cn('flex flex-col items-center p-6', className)}>
      <div className="relative">
        <Image
          src={UrlFormatter.media(achievement?.current?.image || achievement?.next?.image)}
          alt={achievement?.achievement?.name}
          width={400}
          height={400}
          unoptimized
          draggable={false}
          className="w-full rounded-full object-cover select-none"
        />
        <Image
          src={UrlFormatter.media(
            `public/achievements/${(achievement?.current || achievement?.next)?.level?.toLowerCase()}.webp`
          )}
          alt="frame"
          width={400}
          height={400}
          unoptimized
          draggable={false}
          className="absolute bottom-0 left-0 w-full select-none"
        />
      </div>
      <div className="mt-4 flex w-full items-end justify-between">
        <ReText weight="semibold" size="lg">
          {`${achievement.achievement.name} ${(achievement?.current || achievement?.next)?.level} ранга`}
        </ReText>

        <ReText weight="semibold" color="muted-foreground" size="md" className="whitespace-nowrap">
          {progress} / {goal}
        </ReText>
      </div>
      <Progress value={progressProportion * 100} className="mt-2 w-full overflow-hidden" />
      {achievement.achievement.description ? (
        <ReText
          size="sm"
          align="left"
          component="p"
          className="mt-3 break-words"
          color="muted-foreground"
        >
          {achievement.achievement.description}
        </ReText>
      ) : null}
    </div>
  );
};
