import * as React from 'react';

import { makeUseContext } from '../utils';

export type DocumentContextType = {
  getOwnerDocument: (node?: Node | null) => Document;
  getOwnerWindow: (node?: Node | null) => Window;
};

export const DocumentStore = React.createContext<DocumentContextType | null>(null);

export const useDocumentContext = makeUseContext('useDocument', 'DocumentStore', DocumentStore);

export type DocumentContextProviderProps = React.PropsWithChildren & {
  nodeRef: React.RefObject<Node | null>;
};

export function DocumentContextProvider({ nodeRef, children }: DocumentContextProviderProps) {
  const context = React.useMemo(() => {
    const getOwnerDocument = (node?: Node | null) =>
      (node || nodeRef.current)?.ownerDocument || document;
    const getOwnerWindow = (node?: Node | null) => getOwnerDocument(node)?.defaultView || window;
    return { getOwnerDocument, getOwnerWindow };
  }, [nodeRef]);

  return <DocumentStore.Provider value={context}>{children}</DocumentStore.Provider>;
}
