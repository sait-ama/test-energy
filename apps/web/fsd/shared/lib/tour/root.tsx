'use client';

import { memo, ReactNode, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import {
  StepType as ReactTourStepType,
  TourProvider as ReactTourProvider,
  useTour as useReactTour,
} from '@reactour/tour';
import omit from 'lodash.omit';

import { importToastAsync } from '~shared/ui/toast/toast.async';

import { Arrow, Badge, Close, Content, Navigation } from './_internal/components';
import { CurrentTourProvider, TourStepsConfig, useCurrentTourContext } from './_internal/store';
import { DATA_SELECTOR } from './const';

const defaultSteps: ReactTourStepType[] = [];

const TourProvider = memo(({ children }: { children: ReactNode }) => {
  const { currentStep, setCurrentStep } = useCurrentTourContext();

  return (
    <ReactTourProvider
      steps={defaultSteps}
      currentStep={currentStep}
      setCurrentStep={setCurrentStep}
      styles={{
        popover: (base) => ({
          ...base,
          backgroundColor: 'hsl(var(--r-background))',
          borderRadius: 'var(--r-radius-md)',
          border: '1px solid hsl(var(--r-border))',
          padding: '16px 24px',
          margin: '24px',
          pointerEvents: 'auto',
          // zIndex: 10000,
        }),
      }}
      padding={{
        popover: 8,
      }}
      components={{
        Badge,
        Arrow,
        Navigation,
        Content,
        Close,
      }}
    >
      {children}
    </ReactTourProvider>
  );
});

export const TourProviderRoot = memo(({ children }: { children: ReactNode }) => {
  const currentTourContextInit = {
    onError: async () => {
      const toast = await importToastAsync();
      toast.error('Произошлка ошибка');
    },
  };

  return (
    <ErrorBoundary fallback={children}>
      <CurrentTourProvider value={currentTourContextInit}>
        <TourProvider>{children}</TourProvider>
      </CurrentTourProvider>
    </ErrorBoundary>
  );
});

const useTour = ({ tourId }: { tourId: string }) => {
  const { setSteps, steps, isOpen, ...rest } = useReactTour();
  const setTourId = useCurrentTourContext((v) => v?.setTourId);
  const _setConfig = useCurrentTourContext((v) => v?.setConfig);
  const setCurrentStep = useCurrentTourContext((v) => v?.setCurrentStep);

  const { registerTourTargets } = useCurrentTourContext((v) => v.tourControls);

  const setConfig = (config: TourStepsConfig) => {
    if (!setSteps || !config?.steps) return;

    _setConfig?.(config);
    registerTourTargets(config.steps.map((step) => step.target));

    setSteps(
      config.steps.map((step) => {
        const { target, ...rest } = step;
        return {
          ...omit(rest, ['afterStepAsync', 'beforeStepAsync', 'group']),
          selector: `[${DATA_SELECTOR}="${target}"]`,
        };
      })
    );
  };

  const startTour = (config: TourStepsConfig) => {
    setTourId?.(tourId);
    setConfig(config);
    rest.setIsOpen(true);
    setCurrentStep(0);
  };

  const stopTour = () => {
    setTourId?.(null);
    setCurrentStep(0);
    rest.setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) return;

    stopTour();
  }, [isOpen]);

  return { setConfig, startTour, stopTour, isOpen, ...rest };
};

export { TourProviderRoot as TourProvider, useTour };
