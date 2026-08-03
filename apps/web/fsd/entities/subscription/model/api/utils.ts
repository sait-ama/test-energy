import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import {
  benefitsBase,
  benefitType1,
  benefitType2,
  questions1,
  questions2,
  questionsBase,
} from '~pages/(user)/subscribe-tab/model/constants';
import { useSession } from '~shared/lib/session/use-session';

export const useSubscriptionBenefits = () => {
  const { can_buy_premium_type } = useSession() ?? {};
  const t = useTranslations('subscription.benefits');

  return useMemo(() => {
    const benefits = [...benefitsBase];

    if (can_buy_premium_type === 1) {
      // @ts-ignore
      benefits.push(...benefitType1);
    }
    if (can_buy_premium_type === 2) {
      // @ts-ignore
      benefits.push(...benefitType2);
    }

    return benefits.map((it) => ({ ...it, name: t(it.name), description: t(it.description) }));
  }, [can_buy_premium_type]);
};

export const useSubscriptionQuestion = () => {
  const { can_buy_premium_type } = useSession() ?? {};
  const t = useTranslations('subscription.faq.questions');

  return useMemo(() => {
    const questions = [...questionsBase];

    if (can_buy_premium_type === 1) {
      // @ts-ignore
      questions.push(...questions1);
    }
    if (can_buy_premium_type === 2) {
      // @ts-ignore
      questions.push(...questions2);
    }

    return questions.map((it) => ({ ...it, title: t(it.title), description: t(it.description) }));
  }, [can_buy_premium_type]);
};
