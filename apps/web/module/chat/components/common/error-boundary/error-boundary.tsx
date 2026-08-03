import { ErrorBoundary, ErrorBoundaryProps, FallbackProps } from 'react-error-boundary';

import { Button } from '@re/ui-kit/ui/button';

export const ErrorBoundaryBase = ({
  children,
  ...rest
}: {
  children: React.ReactNode;
} & Partial<ErrorBoundaryProps>) => {
  return <ErrorBoundary {...rest}>{children}</ErrorBoundary>;
};

export const ChatErrorBoundary = ({ children, ...rest }: { children: React.ReactNode }) => {
  return <ErrorBoundaryBase {...rest}>{children}</ErrorBoundaryBase>;
};

export const MessageListErrorBoundary = ({ children, ...rest }: { children: React.ReactNode }) => {
  const fallbackRender = ({ resetErrorBoundary }: FallbackProps) => {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <span>У-упс, что-то пошло не так</span>
        <Button variant="outline" onClick={resetErrorBoundary}>
          Перезагрузить
        </Button>
      </div>
    );
  };

  return (
    <ErrorBoundaryBase {...rest} fallbackRender={fallbackRender}>
      {children}
    </ErrorBoundaryBase>
  );
};
