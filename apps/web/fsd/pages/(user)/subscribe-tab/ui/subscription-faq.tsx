import { ComponentProps } from 'react';
import { useTranslations } from 'next-intl';

import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionIndicator,
  AccordionItem,
  AccordionTrigger,
} from '@re/ui-kit/ui/accordion';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useSubscriptionQuestion } from '~entities/subscription/model/api/utils';
import type { ProfileSubscriptionAccordion } from '~pages/(user)/subscribe-tab/model/constants';
import { Section, SectionTitle } from '~shared/ui/section';

const Accordions = ({ title, description }: ProfileSubscriptionAccordion) => (
  <Section className={cn('relative col-span-6 p-3')} key={title}>
    <Accordion type="single" collapsible className="w-full p-0">
      <AccordionItem value="item-1">
        <AccordionHeader>
          <AccordionTrigger className="px-2">
            <ReText align="left">{title}</ReText>
            <AccordionIndicator />
          </AccordionTrigger>
        </AccordionHeader>

        <AccordionContent className="max-w-[830px] px-2 pb-2">
          <ReText color="muted-foreground">{description}</ReText>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </Section>
);
export const SubscriptionFaq = ({ className, ...props }: ComponentProps<'div'>) => {
  const questions = useSubscriptionQuestion();
  const t = useTranslations('subscription.faq');

  return (
    <div className={cn('space-y-3 px-4', className)} {...props}>
      <SectionTitle>{t('heading')}</SectionTitle>
      <div className="grid gap-2 rounded-md">
        {questions.map(({ title, description }) => (
          <Accordions title={title} description={description} key={title} />
        ))}
      </div>
    </div>
  );
};
