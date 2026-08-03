import type { ComponentPropsWithRef } from 'react';
import { useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { Button } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

import { useLastUserRequest } from '~entities/user/model/queries';
import { ChangeRequestType } from '~shared/api/models/panel';
import { Routing } from '~shared/config/routing';

export interface AddCardManualFormActionsProps extends ComponentPropsWithRef<'div'> {}

export const AddCardManualFormActions = (props: AddCardManualFormActionsProps) => {
  const { className, ...rest } = props;
  const { data } = useLastUserRequest({
    variables: {
      query: {
        type: ChangeRequestType.CARD_ITEM_ADD,
      },
    },
  });

  const searchParams = useSearchParams();

  const { href, alreadyUsed } = useMemo(() => {
    if (!data) return { href: '', alreadyUsed: false };

    const query = JSON.stringify({
      rank: data.fields.rank,
      description: data.fields.description,
      character: data.fields.character,
    });
    const currentQuery = searchParams.get('defaultValues');

    const alreadyUsed = currentQuery === query;

    const href = Routing.Card.add({
      query: {
        defaultValues: query,
      },
    });

    return { href, alreadyUsed };
  }, [data]);

  const disabled = !data || alreadyUsed;

  return (
    <div className={cn('flex items-center gap-2', className)} {...rest}>
      <Button variant="flat" color="secondary" asChild>
        <Link
          shallow={false}
          prefetch={false}
          href={Routing.User.requests({
            query: { type: ChangeRequestType.CARD_ITEM_ADD },
          })}
        >
          Заявки
        </Link>
      </Button>
      <Button variant="flat" color="primary" disabled={disabled} asChild>
        <Link shallow={false} prefetch={false} href={disabled ? '#' : href}>
          Использовать последнюю заявку
        </Link>
      </Button>
    </div>
  );
};
