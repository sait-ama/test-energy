'use client';

import confetti from 'canvas-confetti';

import { ReText } from '@re/ui-kit/ui/text';

import { useManageMinigame } from '~entities/battlepass/model/mutations';
import { PuzzleConsumer, PuzzleProvider } from '~entities/games/model/store';
import { SlidePuzzle } from '~features/(games)/slide-puzzle/slide-puzzle';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { importToastAsync } from '~shared/ui/toast/toast.async';

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export const PuzzleGame = ({ imageSet }: { imageSet: Record<number, string> }) => {
  const { mutateAsync } = useManageMinigame();

  const onSuccess = async () => {
    try {
      const toast = await importToastAsync();
      await mutateAsync({ game_id: 46 });
      await confetti();
      toast.success('Вы успешно собрали пазл! Задача выполнена, поздравляем!');
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  return (
    <div className="-mt-12 flex min-h-screen flex-col items-center justify-center gap-8">
      <PuzzleProvider value={imageSet}>
        <div className="flex flex-col">
          <ReText size="xl" component="h1" align="center" weight="semibold">
            Собери пазл
          </ReText>
          <ReText align="center" color="muted-foreground">
            Выполни задание в боевом пропуске!
          </ReText>
        </div>

        <SlidePuzzle onSuccess={onSuccess} />
        <PuzzleConsumer>
          {(context) => (
            <div className="flex w-full max-w-[400px] justify-between gap-2">
              <ReText color="muted-foreground" component="span">
                Время:
                <ReText>{formatTime(context.timer)}</ReText>
              </ReText>
              <ReText color="muted-foreground" component="span">
                Ходов:
                <ReText>{context.moveCount}</ReText>
              </ReText>
            </div>
          )}
        </PuzzleConsumer>
      </PuzzleProvider>
    </div>
  );
};
