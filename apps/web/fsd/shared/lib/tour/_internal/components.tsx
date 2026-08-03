import { ComponentProps } from 'react';

import { components } from '@reactour/tour';

import CloseIcon from '@re/ui-kit/icons/close';

const darkThemeStyles = {
  background: '#1a1a1a',
  textColor: '#ffffff',
  accentColor: '#3b82f6',
  borderRadius: '8px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
};

export const Badge = ({ children, ...props }: ComponentProps<typeof components.Badge>) => (
  <components.Badge
    {...props}
    data-aria-hidden="false"
    aria-hidden="false"
    styles={{
      badge: (base) => ({
        ...base,
        width: 24,
        height: 24,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '9999px',
        fontSize: 11,
        fontWeight: 'bold',
        backgroundColor: 'hsl(var(--r-primary))',
        color: 'hsl(var(--r-primary-foreground))',
      }),
    }}
  >
    {children}
  </components.Badge>
);

export const Close = ({ onClick, disabled, ...props }: ComponentProps<typeof components.Close>) => (
  <components.Close
    {...props}
    styles={{
      close: (base) => ({
        ...base,
        width: 20,
        height: 20,
        borderRadius: 'var(--r-radius-full)',
        backgroundColor: 'hsl(var(--r-muted))',
        border: '1px solid var(--r-border)',
        color: 'hsl(var(--r-muted-foreground))',
        top: -8,
        right: -8,
        padding: 6,
        opacity: disabled ? 0.5 : 1,
        ':hover': {
          color: 'hsl(var(--r-muted-foreground) / 0.9)',
        },
      }),
    }}
    onClick={onClick}
    disabled={disabled}
  >
    <CloseIcon size={12} className="text-current" />
  </components.Close>
);

export const Content = (props: ComponentProps<typeof components.Badge>) => (
  <components.Content
    {...props}
    styles={{
      content: (base) => ({
        ...base,
        backgroundColor: 'hsl(var(--bg-background))',
        // backgroundColor: darkThemeStyles.background,
        // color: darkThemeStyles.textColor,
        padding: '1.5rem',
        boxShadow: darkThemeStyles.boxShadow,
        maxWidth: '400px',
      }),
    }}
  />
);

export const Navigation = (props: ComponentProps<typeof components.Navigation>) => (
  <components.Navigation
    {...props}
    styles={{
      navigation: (base) => ({
        ...base,
        display: 'flex',
        marginTop: '12px',
        justifyContent: 'space-between',
      }),
      button: (base, { disabled, kind }: { disabled: boolean; kind: string }) => {
        if (kind === 'prev') {
          return {
            display: 'none',
          };
        }

        return {
          ...base,
          backgroundColor: disabled ? 'hsl(var(--r-secondary))' : 'hsl(var(--r-primary))',
          color: 'hsl(var(--r-primary-foreground))',
          padding: '0.5rem 1rem',
          borderRadius: 'var(--r-radius-md)',
          gap: '16px',
          // border: 'none',
          cursor: 'pointer',
          ':hover': {
            opacity: 0.9,
          },
          ':disabled': {
            opacity: 0.5,
            cursor: 'not-allowed',
          },
        };
      },
      dot: (base, { current }) => ({
        ...base,
        backgroundColor: current ? 'hsl(var(--r-primary))' : 'hsl(var(--r-bg-secondary))',
        width: '8px',
        height: '8px',
        margin: '0 4px',
        borderRadius: '50%',
        border: '1px solid hsl(var(--r-border))',
        transition: 'background-color 0.2s ease',
        pointerEvents: 'none',
        cursor: 'default',
      }),
    }}
  />
);

export const Arrow = (props: ComponentProps<typeof components.Arrow>) => (
  <components.Arrow
    {...props}
    styles={{
      arrow: (base) => ({
        ...base,
        color: 'hsl(var(--r-primary-foreground))',
        fontSize: '1.5rem',
        ':disabled': {
          opacity: 0.5,
        },
      }),
    }}
  />
);
