import { memo, useCallback, useLayoutEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { RefreshIcon } from '@re/ui-kit/icons/refresh';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';
import { motion } from 'motion/react';

import { useBottomActions } from '~shared/lib/bottom-bar/use-bottom-actions';

import { ReaderBottomActionId } from '../model/const';
import { ImageOptimizedLoaderQueueName } from '../model/helpers/image-optimized-loader';
import { useReaderImageLoader, useReaderImagerLoaderErrors } from '../model/store';

interface BottomActionsProps {
  onReload: () => void;
}

const BottomActions = ({ onReload }: BottomActionsProps) => {
  const t = useTranslations('customErrors.reader');
  const [shouldShow, setShouldShow] = useState(true);

  const handleClick = useCallback(() => {
    onReload();
    setShouldShow(false);
    setTimeout(() => {
      setShouldShow(true);
    }, 2000);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        '!border-border mx-auto mb-10 flex max-w-[420px] items-center justify-between gap-2 overflow-hidden rounded-full p-2 md:mb-0',
        'bg-secondary/90 !border-border border'
      )}
    >
      <ReText className="px-2" weight="semibold">
        {t('image_load_error')}
      </ReText>{' '}
      <Button onClick={handleClick} disabled={!shouldShow}>
        <RefreshIcon className="size-4" />
      </Button>
    </motion.div>
  );
};

export const ReaderImageErrors = memo(() => {
  const hasErrors = useReaderImagerLoaderErrors();
  const { loader, imagesInViewRef } = useReaderImageLoader();

  const { register, unregister } = useBottomActions();

  const handleReload = useCallback(() => {
    loader.retry({
      predicate: (key) => imagesInViewRef.current.has(loader.serializeKey(key)),
      queue: ImageOptimizedLoaderQueueName.PRIME,
    });

    loader.retry({
      predicate: (key) => !imagesInViewRef.current.has(loader.serializeKey(key)),
      queue: ImageOptimizedLoaderQueueName.BACKGROUND,
    });
  }, []);

  useLayoutEffect(() => {
    if (hasErrors) {
      register({
        key: ReaderBottomActionId.ERRORS_IN_VIEW,
        index: 0,
        node: <BottomActions onReload={handleReload} />,
      });
    }

    return () => unregister(ReaderBottomActionId.ERRORS_IN_VIEW);
  }, [hasErrors]);
});
