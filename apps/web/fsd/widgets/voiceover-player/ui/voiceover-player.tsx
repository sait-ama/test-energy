import type { ComponentPropsWithoutRef } from 'react';
import { useState } from 'react';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@re/ui-kit/ui/select';

import { EmptyView } from '~shared/ui/empty-view';
import { isEmpty } from '~shared/utils/is-empty';

const VoiceoverSelect = ({ value, options, onChange, placeholder = 'Выбрать' }) => (
  <Select value={value} onValueChange={(value) => onChange({ value })}>
    <SelectTrigger>
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent>
      <EmptyView isEmpty={!options.length} className="py-2" text="Пусто">
        <SelectGroup>
          {options.map(({ value, label }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectGroup>
      </EmptyView>
    </SelectContent>
  </Select>
);

const getKeyFirstNonEmpty = (object) => {
  for (const key in object) {
    const item = object[key];
    if (!isEmpty(item)) return key;
  }

  return null;
};

const getResolvedValue = (data, currentValue, defaultValue?: any, shouldReset?: any) => {
  let result = currentValue;

  if (isEmpty(data)) return null;
  if (currentValue == null || isEmpty(data?.[currentValue]) || shouldReset) {
    result =
      !defaultValue || isEmpty(data?.[defaultValue]) ? getKeyFirstNonEmpty(data) : defaultValue;
  }

  return result;
};

// @ts-ignore
const getResolvedValues = (data, currValues) => {
  const { dub, chapters, url } = currValues;

  const resolved = {
    dub,
    chapters,
    url,
  };

  resolved.dub = getResolvedValue(data, dub);
  const dubData = resolved.dub != null ? data[resolved.dub] : null;

  resolved.chapters = getResolvedValue(dubData, chapters);
  const chaptersData = resolved.chapters != null ? dubData?.[resolved.chapters] : null;

  resolved.url = chaptersData;

  return resolved;
};

export interface VoiceoverPlayerProps extends ComponentPropsWithoutRef<'div'> {
  model: any;
}

export const VoiceoverPlayer = ({ model, ...rest }: VoiceoverPlayerProps) => {
  const { episodes = {} } = model ?? {};
  const [state, setState] = useState({
    dub: null,
    chapters: null,
  });
  // @ts-ignore
  const { dub, chapters, url } = getResolvedValues(episodes, state);

  const dubsOptions = Object.keys(episodes).map((dub) => ({ value: dub, label: dub }));

  const chaptersData = dub != null ? episodes?.[dub] : {};

  const chaptersOptions = Object.keys(chaptersData).map((chapter) => ({
    value: chapter,
    label: chapter,
  }));

  const generateHandleChange =
    (field) =>
    ({ value }) => {
      setState((prev) => getResolvedValues(episodes, { ...prev, [field]: value }));
    };

  return (
    <div
      className="border-border bg-background flex flex-col overflow-hidden rounded-t-md border"
      {...rest}
    >
      <div className="flex items-center justify-between p-2">
        <div className="flex-[0_1_auto]">
          <VoiceoverSelect
            value={chapters}
            onChange={generateHandleChange('chapters')}
            placeholder="Главы"
            options={chaptersOptions}
          />
        </div>
        <div className="flex-[0_1_auto]">
          <VoiceoverSelect
            value={dub}
            onChange={generateHandleChange('dub')}
            placeholder="Озвучка"
            options={dubsOptions}
          />
        </div>
      </div>
      <iframe
        src={url}
        frameBorder="0"
        className="aspect-video"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};
