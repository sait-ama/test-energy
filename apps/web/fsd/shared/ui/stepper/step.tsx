import { HorizontalStep } from './horizontal-step';
import type { StepProps } from './types';
import { useStepper } from './use-stepper';
import { VerticalStep } from './vertical-step';

// Props which shouldn't be passed to to the Step component from the user
interface StepInternalConfig {
  index: number;
  isCompletedStep?: boolean;
  isCurrentStep?: boolean;
  isLastStep?: boolean;
}

interface FullStepProps extends StepProps, StepInternalConfig {}

const Step = (props: StepProps) => {
  const {
    ref,
    children,
    description,
    icon,
    state,
    checkIcon,
    errorIcon,
    index,
    isCompletedStep,
    isCurrentStep,
    isLastStep,
    isKeepError,
    label,
    onClickStep,
  } = props as FullStepProps;

  const { isVertical, isError, isLoading, clickable } = useStepper();

  const hasVisited = isCurrentStep || isCompletedStep;

  const sharedProps = {
    isLastStep,
    isCompletedStep,
    isCurrentStep,
    index,
    isError,
    isLoading,
    clickable,
    label,
    description,
    hasVisited,
    icon,
    isKeepError,
    checkIcon,
    state,
    errorIcon,
    onClickStep,
    ref,
  };

  if (isVertical) return <VerticalStep {...sharedProps}>{children}</VerticalStep>;

  return <HorizontalStep {...sharedProps}>{children}</HorizontalStep>;
};

export { Step };
