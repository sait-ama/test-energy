import * as React from 'react';

import { Badge } from './Badge';

export default {
  title: 'ui/Badge',
  component: Badge,
};

const Template = (args) => <Badge {...args}>{args.children}</Badge>;

export const Default = Template.bind({});
Default.args = {
  children: 'Default Badge',
  variant: 'default',
};

export const Secondary = Template.bind({});
Secondary.args = {
  children: 'Secondary Badge',
  variant: 'secondary',
};

export const Ghost = Template.bind({});
Ghost.args = {
  children: 'Ghost Badge',
  variant: 'ghost',
};

export const Destructive = Template.bind({});
Destructive.args = {
  children: 'Destructive Badge',
  variant: 'destructive',
};

export const Success = Template.bind({});
Success.args = {
  children: 'Success Badge',
  variant: 'success',
};

export const Warning = Template.bind({});
Warning.args = {
  children: 'Warning Badge',
  variant: 'warning',
};

export const Outline = Template.bind({});
Outline.args = {
  children: 'Outline Badge',
  variant: 'outline',
};

export const CustomClass = Template.bind({});
CustomClass.args = {
  children: 'Custom Class Badge',
  variant: 'default',
  className: 'bg-red-500 text-white',
};
