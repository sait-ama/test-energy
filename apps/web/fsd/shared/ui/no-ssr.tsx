'use client';
import React, { ReactNode } from 'react';
import dynamic from 'next/dynamic';

const NoSsrComponent = (props: { children: ReactNode }) => (
  <React.Fragment>{props.children}</React.Fragment>
);

export const NoSSR = dynamic(() => Promise.resolve(NoSsrComponent), {
  ssr: false,
});

export const withNoSsr = <P extends object>(Component: React.ComponentType<P>) => {
  return function WithNoSsrComponent(props: P) {
    return (
      <NoSSR>
        <Component {...props} />
      </NoSSR>
    );
  };
};
