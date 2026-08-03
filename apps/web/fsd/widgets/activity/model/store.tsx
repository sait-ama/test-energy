import { createContext, ReactNode } from 'react';

import { useStrictContext } from '~shared/utils/use-strict-context';

export interface ActivityWidgetInViewContextSchema {
  inView: boolean;
}

export const ActivityWidgetInViewContext = createContext<ActivityWidgetInViewContextSchema | null>(
  null
);

export interface ActivityWidgetInViewProviderProps {
  children: ReactNode;
  inView: boolean;
}

export const ActivityWidgetInViewProvider = ({
  children,
  inView,
}: ActivityWidgetInViewProviderProps) => {
  return (
    <ActivityWidgetInViewContext.Provider value={{ inView }}>
      {children}
    </ActivityWidgetInViewContext.Provider>
  );
};

export const useActivityWidgetInView = () => useStrictContext(ActivityWidgetInViewContext);

export interface ActivityWidgetInViewConsumer {
  children: (data: ActivityWidgetInViewContextSchema) => ReactNode;
}

export const ActivityWidgetInViewConsumer = ({ children }: ActivityWidgetInViewConsumer) => {
  const data = useActivityWidgetInView();

  return children(data);
};
