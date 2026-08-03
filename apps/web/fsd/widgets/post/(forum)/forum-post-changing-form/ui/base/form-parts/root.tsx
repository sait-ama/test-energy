'use client';
import { ReactNode } from 'react';

export interface FormRootProps {
  className?: string;
  children?: ReactNode;
}

export const FormRoot = (props: FormRootProps) => {
  const { className, children } = props;

  return (
    <form onClick={(e) => e.preventDefault()} className={className}>
      {children}
    </form>
  );
};
