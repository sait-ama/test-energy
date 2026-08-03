import { SVGProps } from 'react';
import { useTheme } from 'next-themes';

import { Button, ButtonProps } from '@re/ui-kit/ui/button';

const LightThemeIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
};

const DarkThemeIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
};

export const ThemeToggleButton = (props: ButtonProps) => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const handleToggleTheme = (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button {...props} circle onClick={handleToggleTheme}>
      {theme === 'dark' ? (
        <DarkThemeIcon className="size-5" />
      ) : (
        <LightThemeIcon className="size-5" />
      )}
    </Button>
  );
};
