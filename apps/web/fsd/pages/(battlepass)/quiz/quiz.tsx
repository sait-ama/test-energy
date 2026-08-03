'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import confetti from 'canvas-confetti';

import ExternalLink from '@re/ui-kit/icons/external-link';
import { Button } from '@re/ui-kit/ui/button';
import { Card } from '@re/ui-kit/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@re/ui-kit/ui/dialog';
import { Progress } from '@re/ui-kit/ui/progress';
import { ReText } from '@re/ui-kit/ui/text';

import { useManageMinigame } from '~entities/battlepass/model/mutations';
import { Routing } from '~shared/config/routing';
import { Container } from '~shared/ui/container';
import { linkBaseVariants } from '~shared/ui/link-base';

export interface Question {
  name: string;
  correctAnswerId: number;
  options: string[];
  authorId?: number;
}

export function Quiz({ questions }: { questions: Question[] }) {
  const t = useTranslations('quiz');

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { mutateAsync } = useManageMinigame();

  const question = questions[currentQuestion]!;

  const handleAnswerClick = (optionIndex: number) => {
    if (isCompleted) return;

    setSelectedOption(optionIndex);
    setShowResult(true);

    if (optionIndex === question.correctAnswerId) {
      setScore(score + 1);
    }
  };

  const handleNext = async () => {
    if (isCompleted) return;

    setSelectedOption(null);
    setShowResult(false);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsCompleted(true);
      setShowScore(true);

      if (score > 6) {
        await confetti();
        //todo promise.all
        //todo enum epta
        await mutateAsync({ game_id: 49 });
      }
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <Container slim className="px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-center gap-2">
          <ReText size="2xl" component="h1" weight="bold">
            {t('title')}
          </ReText>
        </div>

        {!showScore ? (
          <Card className="flex flex-col gap-6 p-6">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  {t('question-number', { start: currentQuestion + 1, end: questions.length })}
                </span>
                <span className="text-sm font-medium">{t('current-score', { score })}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="flex flex-col gap-2">
              <ReText size="xl" component="h2" weight="semibold">
                {question.name}
              </ReText>
              <Link
                target="_blank"
                className={linkBaseVariants({
                  variant: 'secondary',
                  className: 'flex items-center gap-1 text-sm',
                })}
                title={t('author.title')}
                href={Routing.User.detail({ params: { id: question.authorId! } })}
              >
                {t('author.detail')} <ExternalLink className="size-4" />
              </Link>
            </div>
            <div className="grid gap-3">
              {question.options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  color={
                    selectedOption === null
                      ? 'default'
                      : selectedOption === index
                        ? index === question.correctAnswerId
                          ? 'success'
                          : 'danger'
                        : index === question.correctAnswerId && showResult
                          ? 'success'
                          : 'default'
                  }
                  className="h-auto flex-wrap justify-start px-6 py-4 text-left break-all whitespace-normal"
                  onClick={() => !showResult && handleAnswerClick(index)}
                  disabled={showResult}
                >
                  {option}
                </Button>
              ))}
            </div>

            {showResult && (
              <div className="mt-6 flex w-full">
                <Button onClick={handleNext} className="self-end">
                  {t(`${currentQuestion === questions.length - 1 ? 'finish' : 'next'}-trigger`)}
                </Button>
              </div>
            )}
          </Card>
        ) : (
          <Dialog open={showScore} onOpenChange={setShowScore}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="sr-only">{t('finish-sr-only')}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 text-center">
                <div>
                  {t.rich('completed-percentage', {
                    percent: `${Math.round((score / questions.length) * 100)}%`,
                    percentage: (children) => {
                      return <p className="text-4xl font-bold">{children}</p>;
                    },
                    phrase: (children) => {
                      return <span className="text-muted-foreground">{children}</span>;
                    },
                  })}
                </div>
                <p>{t(`results.${score > 6 ? 'success' : 'unluck'}`)}</p>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Container>
  );
}
