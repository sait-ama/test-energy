import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import type { PreferenceCardSource } from '~features/change-preference/model/const';
import type { Preference } from '~shared/api/models/user';
import { LinearGradient } from '~shared/ui/linear-gradient';

interface PreferenceCardProps {
  model: PreferenceCardSource;
  isSelected: boolean;
  onChange: (preference: Preference) => void;
  className?: string;
}

export const PreferenceCard = (props: PreferenceCardProps) => {
  const { model, isSelected, onChange, className } = props;

  return (
    <button
      type="button"
      className={cn(
        'hover-card flex flex-col items-center gap-4 border py-8 hover:after:!hidden',
        isSelected ? '!border-primary' : 'border-border',
        className
      )}
      onClick={() => {
        onChange(model.preference);
      }}
    >
      <LinearGradient
        width={model.width}
        height={model.height}
        src={model.src}
        alt={model.title}
        className="h-52"
      />
      <div className="align-center flex flex-col justify-start">
        <ReText weight="semibold" size="lg">
          {model.title}
        </ReText>
        <ReText size="sm" align="center" color="muted-foreground">
          {model.description}
        </ReText>
      </div>
    </button>
  );
};
