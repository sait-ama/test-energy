import * as React from 'react';

import type { LightBoxComponentProps } from '../../../types';

interface CaptionsContextValue {
  visible: boolean;
  toggle: () => void;
}

export const CaptionsContext = React.createContext<CaptionsContextValue>({
  visible: true,
  toggle: () => {},
});

export function useCaptionsContext() {
  const context = React.useContext(CaptionsContext);
  if (!context) {
    throw new Error('useCaptionsContext must be used within CaptionsContextProvider');
  }
  return context;
}

export function CaptionsContextProvider({ children }: LightBoxComponentProps) {
  const [visible, setVisible] = React.useState(true);

  const toggle = React.useCallback(() => {
    setVisible((prev) => !prev);
  }, []);

  return (
    <CaptionsContext.Provider value={{ visible, toggle }}>{children}</CaptionsContext.Provider>
  );
}
