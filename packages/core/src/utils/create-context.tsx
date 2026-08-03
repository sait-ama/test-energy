import {
  createContext as createReactContext,
  type FC,
  memo,
  PropsWithChildren,
  type ReactNode,
  use,
} from 'react';

interface ProviderProps<Value> {
  value?: Value;
}

interface ContextOptions {
  displayName?: string;
}

const DEFAULT_DISPLAY_NAME = 'Context';

export const createContext = <ContextValue, Value, PropsValue = undefined>(
  createStore: (options: Value, props?: PropsValue) => ContextValue,
  optsOrDisplayName?: ContextOptions | string
) => {
  const options =
    typeof optsOrDisplayName === 'string'
      ? { displayName: optsOrDisplayName }
      : (optsOrDisplayName ?? {});

  const displayName = options?.displayName ?? DEFAULT_DISPLAY_NAME;

  const ReactContext = createReactContext<ContextValue | null>(null);

  const Provider = memo(
    ({ children, value, ...props }: ProviderProps<Value> & PropsWithChildren) => {
      'use no memo';
      // @ts-ignore
      const store = createStore(value!, props);

      return <ReactContext value={store}>{children}</ReactContext>;
    }
  );

  Provider.displayName = `${displayName}Provider`;

  const Consumer: FC<{ children: (value: ContextValue) => ReactNode }> = (props) => {
    'use no memo';
    const { children } = props;

    const value = use(ReactContext);

    return children(value!);
  };

  Consumer.displayName = `${displayName}Consumer`;

  function useStore(componentName?: string): ContextValue;

  function useStore<Selected>(
    selector: (value: ContextValue) => Selected,
    componentName?: string
  ): Selected;

  function useStore<Selected>(
    selectorOrComponentName?: ((value: ContextValue) => Selected) | string,
    maybeComponentName?: string
  ): Selected | ContextValue {
    const context = use(ReactContext);

    if (context === null) {
      const componentName =
        typeof selectorOrComponentName === 'string' ? selectorOrComponentName : maybeComponentName;

      console.warn(
        `use${displayName} must be used within ${displayName}Provider. ${
          componentName ? `The errored call is located in the ${componentName} component.` : ''
        }`
      );

      return undefined as ContextValue;
    }

    if (typeof selectorOrComponentName === 'string' || selectorOrComponentName === undefined) {
      return context;
    }

    return selectorOrComponentName(context);
  }

  return {
    useStore,
    Provider,
    Consumer,
    Context: ReactContext,
  };
};
