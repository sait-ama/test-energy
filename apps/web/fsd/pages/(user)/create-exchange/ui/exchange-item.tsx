import React, { ComponentPropsWithoutRef, ReactNode } from 'react';

import MinusIcon from '@re/ui-kit/icons/minus';
import PlusIcon from '@re/ui-kit/icons/plus';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import {
  UnifiedItemModalTrigger,
  UnifiedItemView,
} from '~features/inventory/ui/item/unified-item-view';
import { UnifiedInventoryItemSchema } from '~shared/api/models/inventory';

import { ExchangeTypeSchema } from '../model/store';

interface ExchangeItemActionsProps extends ComponentPropsWithoutRef<'div'> {
  onRemove?: VoidFunction;
  onAdd?: VoidFunction;
  count?: number;
  countMax?: number;
  disabled?: boolean;

  canAdd?: boolean;
  canRemove?: boolean;
}

export const ExchangeItemActions = (props: ExchangeItemActionsProps) => {
  const {
    className,
    count = 0,
    countMax = 0,
    canAdd = true,
    canRemove = true,
    onRemove,
    onAdd,
    disabled = false,
    ...rest
  } = props;

  return (
    <div
      className={cn(
        'bg-background flex items-center justify-between gap-2 rounded-md p-[6px]',
        className
      )}
      {...rest}
    >
      <Button
        disabled={disabled || !canRemove || !count}
        size="sm"
        variant="flat"
        color="danger"
        className="rounded-xs"
        circle
        onClick={canRemove ? onRemove : undefined}
      >
        <MinusIcon />
      </Button>
      <ReText size="sm" weight="medium" component="span">
        {disabled ? `-/-` : `${count}/${countMax}`}
      </ReText>
      <Button
        disabled={disabled || !canAdd || count >= countMax}
        size="sm"
        variant="flat"
        color="primary"
        className="rounded-xs"
        circle
        onClick={canAdd ? onAdd : undefined}
      >
        <PlusIcon />
      </Button>
    </div>
  );
};

export interface ExchangeItemProps {
  type: ExchangeTypeSchema;
  model: UnifiedInventoryItemSchema;
  isActive?: boolean;
  actions?: ReactNode;
}

export const ExchangeItem = (props: ExchangeItemProps) => {
  const { type, model, isActive, actions } = props;

  return (
    <div className={cn('bg-secondary rounded-md p-2', isActive && 'border-primary border')}>
      <UnifiedItemModalTrigger type={type} model={model}>
        <div className="flex aspect-[2/3] cursor-pointer items-center justify-center transition-opacity duration-300 hover:opacity-50">
          <UnifiedItemView type={type} model={model} />
        </div>
      </UnifiedItemModalTrigger>
      <div className="mt-1">{actions}</div>
    </div>
  );
};

export interface ExchangeItemPlaceholderProps {
  isLoading?: boolean;
  isEmpty?: boolean;
}

export const ExchangeItemPlaceholder = (props: ExchangeItemPlaceholderProps) => {
  const { isLoading = false, isEmpty = false } = props;

  return (
    <div className={cn('rounded-md p-2', isEmpty ? 'border-border border' : 'bg-secondary')}>
      <div
        className={cn('aspect-[2/3] w-full', isLoading && 'bg-background animate-pulse rounded-md')}
      />
      <div className="mt-1 h-8" />
    </div>
  );
};
