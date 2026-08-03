import { AchievementCardPreview } from '~entities/achievements/ui/achievement-card-modal';
import { InfoModalType } from '~shared/api/models/info-modal';
import type { UserAchievementSchema } from '~shared/api/models/user';
import { useInfoModal } from '~shared/lib/info-modal/use-info-modal';

import { AchievementCard } from './achievement-card';

interface AchievementCardWithModal {
  model: UserAchievementSchema;
}

export const AchievementCardWithModal = (props: AchievementCardWithModal) => {
  const open = useInfoModal((v) => v.open);

  const handleClick = () => {
    open({
      type: InfoModalType.CUSTOM,
      content: <AchievementCardPreview achievement={props.model} />,
      srOnly: 'Превью достижения',
      contentProps: {
        className: '!max-w-lg border-none p-0 p-0',
      },
    });
  };

  return (
    <AchievementCard
      withHover
      {...props}
      className="flex items-center justify-start"
      onClick={handleClick}
    />
  );
};
