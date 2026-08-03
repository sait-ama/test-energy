import * as React from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionIndicator,
  AccordionItem,
  AccordionTrigger,
} from './Accordion';

export default {
  title: 'ui/Accordion',
  component: Accordion,
};

const Template = (args) => (
  <Accordion {...args}>
    <AccordionItem value="1">
      <AccordionHeader>
        <AccordionTrigger>
          Item 1
          <AccordionIndicator />
        </AccordionTrigger>
      </AccordionHeader>
      <AccordionContent>This is the content for item 1.</AccordionContent>
    </AccordionItem>
    <AccordionItem value="2">
      <AccordionHeader>
        <AccordionTrigger>
          Item 2
          <AccordionIndicator />
        </AccordionTrigger>
      </AccordionHeader>
      <AccordionContent>This is the content for item 2.</AccordionContent>
    </AccordionItem>
    <AccordionItem value="3">
      <AccordionHeader>
        <AccordionTrigger>
          Item 3
          <AccordionIndicator />
        </AccordionTrigger>
      </AccordionHeader>
      <AccordionContent>This is the content for item 3.</AccordionContent>
    </AccordionItem>
  </Accordion>
);

export const Default = Template.bind({});
Default.args = {
  type: 'single',
};

export const OpenItem = Template.bind({});
OpenItem.args = {
  type: 'single',
  defaultValue: '1',
  collapsible: true,
};

export const MultipleItemsOpen = Template.bind({});
MultipleItemsOpen.args = {
  type: 'multiple',
  defaultValue: ['1', '2'],
};
