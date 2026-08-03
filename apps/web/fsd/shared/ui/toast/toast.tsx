'use client';

import { useTheme } from 'next-themes';

import { Toaster as Sonner } from 'sonner';

import { useSiteConfig } from '~app/providers/site-config-provider';

type ToasterProps = React.ComponentProps<typeof Sonner>;

export const Toaster = (props: ToasterProps) => {
  const { resolvedTheme } = useTheme();
  const direction = useSiteConfig((v) => v.localization.direction);

  return (
    <Sonner
      duration={5000}
      theme={resolvedTheme as ToasterProps['theme']}
      className="toaster group"
      richColors
      dir={direction}
      position="bottom-center"
      expand
      visibleToasts={3}
      toastOptions={{
        className: 'mb-[var(--bottom-bar-height)] md:mb-2 !pointer-events-auto',
        classNames: {
          error: '!bg-[red] !text-white border-none border-0',
          toast:
            'group tooltip group-[.toaster]:!rounded-sm group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:!border-border group-[.toaster]:!shadow-lg',
          description: 'group-[.tooltip]:text-muted-foreground',
          actionButton: 'group-[.tooltip]:bg-primary group-[.tooltip]:text-primary-foreground',
          cancelButton: 'group-[.tooltip]:bg-muted group-[.tooltip]:text-muted-foreground',
          closeButton:
            'group-[.tooltip]:bg-muted group-[.tooltip]:text-muted-foreground border-border ',
        },
      }}
      {...props}
    />
  );
};
