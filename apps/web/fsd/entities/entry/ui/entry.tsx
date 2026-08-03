import type { ComponentProps } from 'react';

import type { TextProps } from '@re/ui-kit/ui/text';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import classes from './entry.module.scss';

interface EntryRootProps extends ComponentProps<'div'> {}

export const EntryRoot = (props: EntryRootProps) => {
  const { children, className, style } = props;

  return (
    <div className={cn(classes.container, className)} style={style}>
      {children}
    </div>
  );
};

type EntryTitleProps = TextProps;

export const EntryTitle = (props: EntryTitleProps) => {
  const { children, ...rest } = props;

  return (
    <ReText component="h1" size="xl" {...rest}>
      {children}
    </ReText>
  );
};

interface EntryContentProps extends ComponentProps<'div'> {
  children?: string;
}

export const EntryContent = (props: EntryContentProps) => {
  const { children = '', ...rest } = props;

  return <div {...rest} dangerouslySetInnerHTML={{ __html: children }} />;
};
