import { createContext, JSX, ReactNode } from 'react';

export const EntityNodeViewContext = createContext<{
  renderNode: (opts: {
    nodetype: string;
    entity: string;
    entityId: string;
    model: any;
    models: Record<string, any>;
    remove: () => void;
  }) => JSX.Element | null;
  models: Record<string, any>;
} | null>(null);

export interface EntityNodeViewProviderProps {
  children: ReactNode;
  renderNode: (opts: {
    nodetype: string;
    entity: string;
    entityId: string;
    model: any;
    models: Record<string, any>;
    remove: () => void;
  }) => JSX.Element | null;
  models: Record<string, any>;
}

export const EntityNodeViewProvider = ({
  children,
  renderNode,
  models,
}: EntityNodeViewProviderProps) => {
  const context = {
    renderNode,
    models,
  };

  return (
    <EntityNodeViewContext.Provider value={context}>{children}</EntityNodeViewContext.Provider>
  );
};
