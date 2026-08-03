import { createContext } from '@re/core/utils/create-context';

type CatalogContextType = {
  fieldSchema: any;
};

export const { Provider: CatalogHeaderProvider, useStore: useCatalogHeader } = createContext<
  CatalogContextType,
  CatalogContextType,
  CatalogContextType
>((_v, { fieldSchema } = { fieldSchema: null }) => ({ fieldSchema }));
