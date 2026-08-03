import type { CSSProperties, FC, ReactNode } from 'react';

import { ReText } from '@re/ui-kit/ui/text';

interface ErrorBaseProps {
  status: NumberIsomorphic;
  text: string;
  label?: ReactNode;
  image?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export const ErrorBase: FC<ErrorBaseProps> = ({
  status,
  label,
  text,
  image,
  actions,
  footer,
  ...rest
}) => (
  <div {...rest}>
    <div className="flex max-w-[400px] flex-col items-center justify-center">
      <div className="pb-8 select-none">
        <div className="relative">
          {image}
          {label ?? (
            <ReText size="lg" align="center" className="relative mb-4 text-[96px] font-semibold">
              {status}
            </ReText>
          )}
        </div>
        <ReText size="md" align="center" className="relative font-medium" color="muted-foreground">
          {text}
        </ReText>
      </div>
      <div className="relative flex flex-col items-center">
        {actions}
        {footer}
      </div>
    </div>
  </div>
);
