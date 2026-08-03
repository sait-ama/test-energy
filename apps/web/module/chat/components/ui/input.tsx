import type { RefObject } from 'react';
import React, { forwardRef, memo, useEffect, useRef } from 'react';

import ArrowDown from '@re/ui-kit/icons/arrow-down';
import ArrowUp from '@re/ui-kit/icons/arrow-top';
import CloseIcon from '@re/ui-kit/icons/close';
import { Button } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

import useLastCallback from '../../hooks/use-last-callback';
import useFlag from '../../hooks/useFlag';
import useForkRef from '../../hooks/useForkRef';
import useInputFocusOnOpen from '../../hooks/useInputFocusOnOpen';
import { LoadingIndicator } from './loading-indicator';
import { Transition } from './transition';

type OwnProps = {
  ref?: RefObject<HTMLInputElement>;
  children?: React.ReactNode;
  resultsItemSelector?: string;
  className?: string;
  inputId?: string;
  value?: string;
  focused?: boolean;
  isLoading?: boolean;
  spinnerColor?: 'yellow';
  spinnerBackgroundColor?: 'light';
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
  canClose?: boolean;
  autoFocusSearch?: boolean;
  hasUpButton?: boolean;
  hasDownButton?: boolean;
  teactExperimentControlled?: boolean;
  withBackIcon?: boolean;
  onChange?: (value: string) => void;
  onStartBackspace?: NoneToVoidFunction;
  onBack?: NoneToVoidFunction;
  onReset?: NoneToVoidFunction;
  onFocus?: NoneToVoidFunction;
  onBlur?: NoneToVoidFunction;
  onClick?: NoneToVoidFunction;
  onUpClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onDownClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onSpinnerClick?: NoneToVoidFunction;
};

const UnmemoizedSearchInput = forwardRef<HTMLInputElement, OwnProps>(
  (
    {
      children,
      resultsItemSelector,
      value,
      inputId,
      className,
      focused,
      isLoading = false,
      placeholder,
      disabled,
      autoComplete,
      canClose,
      autoFocusSearch,
      hasUpButton,
      hasDownButton,
      withBackIcon,
      onChange,
      onBack,
      onStartBackspace,
      onReset,
      onFocus,
      onBlur,
      onClick,
      onUpClick,
      onDownClick,
      onSpinnerClick,
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const handleRef = useForkRef(ref, inputRef);

    const [isInputFocused, markInputFocused, unmarkInputFocused] = useFlag(focused);

    useInputFocusOnOpen(inputRef, autoFocusSearch, unmarkInputFocused);

    useEffect(() => {
      if (!inputRef.current) {
        return;
      }

      if (focused) {
        inputRef.current.focus();
      } else {
        inputRef.current.blur();
      }
    }, [focused, placeholder]); // Trick for setting focus when selecting a contact to search for

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
      const { currentTarget } = event;
      onChange?.(currentTarget.value);

      if (!isInputFocused) {
        handleFocus();
      }
    }

    function handleFocus() {
      markInputFocused();
      onFocus?.();
    }

    function handleBlur() {
      unmarkInputFocused();
      onBlur?.();
    }

    const handleKeyDown = useLastCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!resultsItemSelector) return;
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        const element = document.querySelector(resultsItemSelector) as HTMLElement;
        if (element) {
          element.focus();
        }
      }

      if (
        e.key === 'Backspace' &&
        e.currentTarget.selectionStart === 0 &&
        e.currentTarget.selectionEnd === 0
      ) {
        onStartBackspace?.();
      }
    });

    return (
      <div
        className={cn(
          'border-input bg-secondary flex h-10 w-full flex-row items-center gap-2 rounded-full px-2 py-2 pl-4 text-sm',
          className,
          isInputFocused && 'has-focus'
        )}
        onClick={onClick}
      >
        <div>{children}</div>
        <input
          ref={handleRef}
          id={inputId}
          type="text"
          dir="auto"
          placeholder={placeholder || 'Поиск'}
          className="form-control"
          value={value}
          disabled={disabled}
          autoComplete={autoComplete}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
        {hasUpButton && (
          <Button size="sm" color="translucent" onClick={onUpClick} disabled={!onUpClick}>
            <ArrowUp name="up" />
          </Button>
        )}
        {hasDownButton && (
          <Button
            circle
            size="sm"
            color="translucent"
            onClick={onDownClick}
            disabled={!onDownClick}
          >
            <ArrowDown name="down" />
          </Button>
        )}
        <div className="flex items-center justify-center">
          <Transition>
            {isLoading ? (
              <LoadingIndicator className="size-4" onClick={onSpinnerClick} />
            ) : (
              (value || canClose) &&
              onReset && (
                <Button circle size="sm" variant="ghost" onClick={onReset}>
                  <CloseIcon name="close" className="size-6" />
                </Button>
              )
            )}
          </Transition>
        </div>
      </div>
    );
  }
);

export const SearchInput = memo(UnmemoizedSearchInput) as typeof UnmemoizedSearchInput;
SearchInput.displayName = 'SearchInput';
