import React, { ForwardedRef, useCallback, useEffect, useMemo, useState } from 'react';

import { cn as clsx } from '@re/ui-kit/utils/cn';

import { escapeRegExp } from '../message/renderText';

export interface SuggestionItemProps {
  className?: string;
  component: React.ComponentType<any>;
  item: any;
  onClickHandler: (event: React.MouseEvent<HTMLAnchorElement> | null, item: any) => void;
  onSelectHandler: (item: any) => void;
  selected: boolean;
  style?: React.CSSProperties;
  value?: string;
}

const SuggestionItem = React.forwardRef(function Item(
  props: SuggestionItemProps,
  innerRef: ForwardedRef<HTMLAnchorElement>
) {
  const {
    className,
    component: Component,
    item,
    onClickHandler,
    onSelectHandler,
    selected,
    style,
  } = props;

  const handleSelect = useCallback(() => onSelectHandler(item), [item, onSelectHandler]);
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => onClickHandler(event, item),
    [item, onClickHandler]
  );

  return (
    <li className={clsx(className, { 'bg-accent/50': selected })} style={style}>
      <a
        href=""
        onClick={handleClick}
        onFocus={handleSelect}
        onMouseEnter={handleSelect}
        ref={innerRef}
        className="w-full"
      >
        <Component entity={item} selected={selected} />
      </a>
    </li>
  );
});

export interface ListProps {
  className?: string;
  component: React.ComponentType<any>;
  currentTrigger: string;
  dropdownScroll: (item: HTMLElement | null) => void;
  getSelectedItem?: (item: any) => void;
  getTextToReplace: (item: any) => { text: string; caretPosition: string | number; key?: string };
  itemClassName?: string;
  itemStyle?: React.CSSProperties;
  onSelect: (textToReplace: { text: string; caretPosition: string | number }) => void;
  selectionEnd: number;
  style?: React.CSSProperties;
  value: string;
  values: any[];
}

export const TextareaSuggestions = ({
  className,
  component,
  currentTrigger,
  dropdownScroll,
  getSelectedItem,
  getTextToReplace,
  itemClassName,
  itemStyle,
  onSelect,
  selectionEnd,
  style,
  value: propValue,
  values,
}: ListProps) => {
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | undefined>(undefined);

  const itemsRef: Array<HTMLElement | null> = [];

  const isSelected = (item: any) =>
    selectedItemIndex === values.findIndex((value) => getId(value) === getId(item));

  const getId = (item: any) => {
    const textToReplace = getTextToReplace(item);
    if (textToReplace.key) {
      return textToReplace.key;
    }

    if (typeof item === 'string' || !item.key) {
      return textToReplace.text;
    }

    return item.key;
  };

  const findItemIndex = useCallback(
    (item: any) =>
      values.findIndex((value) => (value.id ? value.id === item.id : value.name === item.name)),
    [values]
  );

  const modifyText = (value: any) => {
    if (!value) return;

    onSelect(getTextToReplace(value));
    if (getSelectedItem) getSelectedItem(value);
  };

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement> | null, item: any) => {
      e?.preventDefault();

      const index = findItemIndex(item);

      modifyText(values[index]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [modifyText, findItemIndex]
  );

  const selectItem = useCallback(
    (item: any) => {
      const index = findItemIndex(item);
      setSelectedItemIndex(index);
    },
    [findItemIndex]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        setSelectedItemIndex((prevSelected) => {
          if (prevSelected === undefined) return 0;
          const newIndex = prevSelected === 0 ? values.length - 1 : prevSelected - 1;
          const ref = itemsRef[newIndex];
          if (ref) dropdownScroll(ref);
          return newIndex;
        });
      }

      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        setSelectedItemIndex((prevSelected) => {
          if (prevSelected === undefined) return 0;
          const newIndex = prevSelected === values.length - 1 ? 0 : prevSelected + 1;
          const ref = itemsRef[newIndex];
          if (ref) dropdownScroll(ref);
          return newIndex;
        });
      }

      if ((event.key === 'Enter' || event.key === 'Tab') && selectedItemIndex !== undefined) {
        handleClick(null, values[selectedItemIndex]);
      }

      return null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedItemIndex, values]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, false);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (values?.length) selectItem(values[0]);
  }, [values, selectItem]);

  const restructureItem = useCallback(
    (item: any) => {
      const matched = item.username || item.id;

      const textBeforeCursor = propValue.slice(0, selectionEnd);
      const triggerIndex = textBeforeCursor.lastIndexOf(currentTrigger);
      const editedPropValue = escapeRegExp(textBeforeCursor.slice(triggerIndex + 1));

      const parts = matched.split(new RegExp(`(${editedPropValue})`, 'gi'));

      const itemNameParts = { match: editedPropValue, parts };

      return { ...item, itemNameParts };
    },
    [propValue, selectionEnd, currentTrigger]
  );

  const restructuredValues = useMemo(() => values.map(restructureItem), [values, restructureItem]);

  return (
    <ul className={clsx('', className)} style={style}>
      {restructuredValues.map((item, i) => (
        <SuggestionItem
          className={itemClassName}
          component={component}
          item={item}
          key={getId(item)}
          onClickHandler={handleClick}
          onSelectHandler={selectItem}
          ref={(ref) => {
            itemsRef[i] = ref;
          }}
          selected={isSelected(item)}
          style={itemStyle}
          value={propValue}
        />
      ))}
    </ul>
  );
};
