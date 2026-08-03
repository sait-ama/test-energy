'use server';

import { Suspense } from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { ExternalLinkIcon } from '@re/ui-kit/icons/external-link';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import { Routing } from '~shared/config/routing';
import { Container } from '~shared/ui/container';
import { Underline } from '~shared/ui/underline';

import { QuizEditForm } from './quiz-edit-form';

export interface QuizEditPageProps {
  id: string;
}

export const QuizEditPage = async (props: QuizEditPageProps) => {
  const { id } = props;

  const t = await getTranslations('quiz-edit.content');

  return (
    <Container slim className="flex flex-col gap-4 px-3 py-4">
      <div className="flex w-full items-center justify-between gap-4">
        <Underline>
          <ReText size="xl" weight="semibold">
            {t('title')}
          </ReText>
        </Underline>

        <Button circle asChild color="secondary">
          <Link
            prefetch={false}
            href={Routing.Quiz.detail({
              params: { id },
            })}
          >
            <ExternalLinkIcon className="size-6" />
          </Link>
        </Button>
      </div>
      <Suspense fallback={null}>
        <QuizEditForm />
      </Suspense>
    </Container>
  );
};
