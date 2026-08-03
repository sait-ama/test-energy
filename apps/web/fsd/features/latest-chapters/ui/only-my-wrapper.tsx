import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { createContext } from '@re/core/utils/create-context';
import { Button } from '@re/ui-kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@re/ui-kit/ui/dropdown-menu';

import type { OnlyMy } from '~shared/api/models/latest-chapter';
import { OnlyMyEnum } from '~shared/api/models/latest-chapter';
import { useLoggedCheck } from '~shared/lib/session/use-logged';

interface OnlyMyBookmarks {
  onlyMy: OnlyMy;
  setOnlyMy: Dispatch<SetStateAction<OnlyMy>>;
}

const { Provider: OnlyMyLatestChapterContextProvider, useStore: useOnlyMyBookmarks } =
  createContext<OnlyMyBookmarks, void>(() => {
    const [onlyMy, setOnlyMy] = useState<OnlyMy>(OnlyMyEnum.ALL);

    return { onlyMy, setOnlyMy };
  }, 'OnlyMyLatestChapterContextProvider');

interface OnlyMyLatestChaptersToggleProps {
  onlyMy: OnlyMy;
  onToggle: (value: OnlyMy) => void;
}

interface OnlyMyLatestChaptersTriggerProps {
  children: (options: OnlyMyLatestChaptersToggleProps) => ReactNode;
}

export const OnlyMyLatestChaptersTrigger = (props: OnlyMyLatestChaptersTriggerProps) => {
  const { children } = props;
  const context = useOnlyMyBookmarks();
  const checkLogged = useLoggedCheck();
  const { onlyMy, setOnlyMy } = context;

  const handleToggle = (value: OnlyMy) => {
    setOnlyMy(value);
  };

  const values = { onlyMy, onToggle: checkLogged(handleToggle) };

  if (typeof children !== 'function') {
    throw new Error('Children should be a function');
  }

  return children(values);
};

// TODO: Lazy import
export const OnlyMyLatestChaptersToggle = ({
  onlyMy,
  onToggle,
}: OnlyMyLatestChaptersToggleProps) => {
  const t = useTranslations('publisher.common.sections.latest-chapters.filters');
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button color="secondary">{t('title')}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuCheckboxItem
          checked={onlyMy === OnlyMyEnum.ALL}
          onCheckedChange={() => {
            onToggle(OnlyMyEnum.ALL);
          }}
        >
          {t('options.all')}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={onlyMy === OnlyMyEnum.EXCLUDE}
          onCheckedChange={() => {
            onToggle(OnlyMyEnum.EXCLUDE);
          }}
        >
          {t('options.exclude')}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={onlyMy === OnlyMyEnum.ONLY}
          onCheckedChange={() => {
            onToggle(OnlyMyEnum.ONLY);
          }}
        >
          {t('options.only')}
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface OnlyMyContextConsumerProps {
  children: ({ onlyMy }: { onlyMy: OnlyMy }) => ReactNode;
}

export const OnlyMyContextConsumer = (props: OnlyMyContextConsumerProps) => {
  const { children } = props;
  const onlyMy = useOnlyMyBookmarks((v) => v.onlyMy);

  return children({ onlyMy });
};

export { OnlyMyLatestChapterContextProvider };
