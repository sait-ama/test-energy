import { memo } from 'react';
import { useTranslations } from 'next-intl';

import CloseIcon from '@re/ui-kit/icons/close';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import { useStrictContext } from '~shared/utils/use-strict-context';

import { MENTION_VARIANTS } from '../../../../model/const';
import { MentionContext, MentionContextSchema } from '../../../../model/store';

export const IndefiniteMentionContent = memo(() => {
  const { setMention } = useStrictContext<MentionContextSchema>(MentionContext);
  const t = useTranslations('mention-popover');

  const handleChooseMention = (type: string) => {
    setMention((prev) => ({ ...prev, type }));
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <ReText>{t('indefinite.label')}</ReText>
        <Button color="muted" circle size="sm" onClick={() => setMention(null)}>
          <CloseIcon />
        </Button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {MENTION_VARIANTS.map((it) => (
          <Button key={it.type} color="muted" onClick={() => handleChooseMention(it.type)}>
            {t(`indefinite.tabs.${it.tName}`)}
          </Button>
        ))}
      </div>
    </div>
  );
});
