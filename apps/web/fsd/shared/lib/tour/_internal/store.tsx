'use client';

import { useEffect, useRef, useState } from 'react';

import { StepType as ReactTourStepType } from '@reactour/tour';

import { createContext } from '@re/core/utils/create-context';

type CurrentTourContextInit = {
  onError?: () => void;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CurrentTourContextValue = any;

export type StepActions = {
  afterStepAsync?: () => void | Promise<void>;
  beforeStepAsync?: () => void | Promise<void>;
};
export type StepType = Pick<ReactTourStepType, 'content' | 'stepInteraction' | 'position'> &
  StepActions & {
    target: string;
    //todo: make plural
    group?: string;
  };

export type TourStepsConfig = {
  steps: StepType[];
  groups?: {
    [name: string]: StepActions;
  };
};

export const { Provider: CurrentTourProvider, useStore: useCurrentTourContext } = createContext<
  CurrentTourContextValue,
  CurrentTourContextInit
>((options) => {
  const { onError } = options;
  const [tourId, setTourId] = useState<string | null>(null);
  const targets = useRef<Map<string, { mounted: boolean }>>(new Map());
  const [config, setConfig] = useState<TourStepsConfig>({
    steps: [],
  });

  const { steps, groups } = config;
  const [currentStep, _setCurrentStep] = useState(0);
  const targetTasks = useRef<Map<string, () => void | Promise<void>>>(new Map());

  const handleError = () => {
    onError?.();
  };

  const tourControls = {
    registerTourTargets: (targetIds: string[]) => {
      const map = new Map<string, { mounted: boolean }>();
      targetIds.forEach((id) => {
        map.set(id, { mounted: false });
      });
      targets.current = map;
    },
    unregisterTourTargets: () => {
      targets.current = new Map();
    },
  };

  const tourItemControls = {
    registerItemMounted: (targetId: string) => {
      if (!targets.current.has(targetId) || !tourId) return;

      targets.current.set(targetId, { mounted: true });

      const task = targetTasks.current.get(targetId);
      if (task) {
        targetTasks.current.delete(targetId);
        task();
      }
    },
    unregisterItemUnmounted: (targetId: string) => {
      if (!targets.current.has(targetId) || !tourId) return;

      targets.current.set(targetId, { mounted: false });
    },
  };

  const setCurrentStep = async (step: number) => {
    const prevStep = steps[step - 1];
    const currStep = steps[step];

    if (!currStep?.target) return;

    const handleSetCurrentStep = async () => {
      if (prevStep?.afterStepAsync) {
        await prevStep.afterStepAsync();
      }

      const prevStepGroup = (groups && prevStep?.group && groups[prevStep.group]) || null;

      if (prevStep?.group !== currStep?.group && prevStepGroup?.afterStepAsync) {
        await prevStepGroup.afterStepAsync();
      }

      if (currStep?.beforeStepAsync) {
        await currStep.beforeStepAsync();
      }

      const currStepGroup = (groups && currStep?.group && groups[currStep.group]) || null;

      if (prevStep?.group !== currStep?.group && currStepGroup?.beforeStepAsync) {
        await currStepGroup.beforeStepAsync();
      }

      const setStepFunc = () => _setCurrentStep(step);

      if (targets.current.get(currStep?.target)?.mounted) {
        setStepFunc();
        return;
      }

      targetTasks.current.set(currStep.target, setStepFunc);
    };

    await handleSetCurrentStep();
  };

  useEffect(() => {
    if (!tourId) {
      tourControls.unregisterTourTargets();
    }
  }, [tourId]);

  return {
    tourId,
    setTourId,
    setConfig,
    config,
    currentStep,
    setCurrentStep,
    tourControls,
    tourItemControls,
  };
}, 'CurrentTourStore');
