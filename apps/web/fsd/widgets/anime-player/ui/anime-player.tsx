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

const AnimeSelect = ({ value, options, onChange, placeholder = 'Выбрать', className }) => (
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

const enum DubType {
  VOICE = 'voice',
  SUBTITLES = 'subtitles',
}

const enum Defaults {
  SEASON = '1',
  SERIE = '1',
  DUB_TYPE = DubType.VOICE,
}

type Dub = Record<string, string>;

type DubTypes = Record<DubType, Dub | {}>;

type Serie = Record<string, DubTypes>;

type Season = Record<string, Serie>;

type AnimeSchema = Record<string, Season>;

const generateDubTypeOptions = (episode?: Partial<Record<DubType, any>> | null) => {
  if (!episode) return [];
  const dubTypeOptionsAll = [
    { value: DubType.VOICE, label: 'Озвучка' },
    { value: DubType.SUBTITLES, label: 'Субтитры' },
  ];

  const dubTypeOptions: { value: DubType; label: string }[] = [];

  for (const option of dubTypeOptionsAll) {
    if (!isEmpty(episode[option.value])) {
      dubTypeOptions.push(option);
    }
  }

  return dubTypeOptions;
};

const getKeyFirstNonEmpty = (object) => {
  for (const key in object) {
    const item = object[key];
    if (!isEmpty(item)) return key;
  }

  return null;
};
const getResolvedValue = <ReturnT,>(
  data,
  currentValue?: EpisodeState[EpisodeStateKeys],
  defaultValue?: Defaults,
  shouldReset?: boolean
) => {
  let result = currentValue;

  if (isEmpty(data)) return null;
  if (currentValue == null || isEmpty(data?.[currentValue]) || shouldReset) {
    result =
      !defaultValue || isEmpty(data?.[defaultValue]) ? getKeyFirstNonEmpty(data) : defaultValue;
  }

  return result as ReturnT;
};
const getResolvedValues = (
  data: AnimeSchema,
  currValues: EpisodeState,
  prevValues?: EpisodeState
) => {
  const { season, serie, dubType, dub } = currValues;

  const resolved: EpisodeState = {
    season: null,
    serie: null,
    dubType: null,
    dub: null,
    url: null,
  };

  resolved.season = getResolvedValue(data, season, Defaults.SEASON);

  const seasonData = resolved.season != null ? data[resolved.season] : null;

  const prevSeason = prevValues?.season;
  resolved.serie = getResolvedValue(
    seasonData,
    serie,
    Defaults.SERIE,
    !(prevSeason == season || !prevValues)
  );
  const serieData = resolved.serie != null ? seasonData?.[resolved.serie] : null;

  resolved.dubType = getResolvedValue(serieData, dubType, Defaults.DUB_TYPE);
  const dubTypeData = resolved.dubType != null ? serieData?.[resolved.dubType] : null;

  resolved.dub = getResolvedValue(dubTypeData, dub);
  const dubData = resolved.dub != null ? dubTypeData?.[resolved.dub] : null;

  resolved.url = dubData;

  return resolved;
};

interface EpisodeState {
  season: string | null;
  serie: string | null;
  dubType: DubType | null;
  dub: string | null;
  url: string | null;
}

type EpisodeStateKeys = keyof EpisodeState;

export interface AnimePlayerProps extends ComponentPropsWithoutRef<'div'> {
  model: any;
}

export const AnimePlayer = (props: AnimePlayerProps) => {
  const { model, ...rest } = props;

  const [state, setState] = useState<EpisodeState>({
    season: null,
    serie: null,
    dubType: null,
    dub: null,
    url: null,
  });

  const seasons = model?.episodes ?? {};
  const { season, serie, dubType, dub, url } = getResolvedValues(seasons, state);

  const seasonOptions = Object.keys(seasons).map((season) => ({
    value: season,
    label: `${season} сезон`,
  }));

  const series = season != null ? seasons?.[season] : {};

  const seriesOptions = Object.keys(series).map((serie) => ({
    value: serie,
    label: `${serie} серия`,
  }));

  const serieData = serie != null ? series?.[serie] : {};
  const voice = serieData?.voice ?? {};
  const subtitles = serieData?.subtitles ?? {};

  const dubTypeOptions = generateDubTypeOptions(serieData);

  const dubsOptions =
    dubType === DubType.VOICE
      ? (Object.keys(voice).map((dubber) => ({ value: dubber, label: dubber })) ?? [])
      : (Object.keys(subtitles).map((dubber) => ({ value: dubber, label: dubber })) ?? []);

  const generateHandleChange =
    (field: Exclude<EpisodeStateKeys, 'url'>) =>
    ({ value }) => {
      setState((prev) => getResolvedValues(seasons, { ...prev, [field]: value }, prev));
    };

  return (
    <div
      className="border-border bg-background grid gap-2 overflow-hidden rounded-md border [grid-template-areas:'types''content''series'] md:[grid-template-areas:'series_types''content_content']"
      {...rest}
    >
      <div className="flex gap-2 px-2 pb-2 [grid-area:series] md:pt-2 md:pb-0">
        <AnimeSelect
          value={season}
          placeholder="Сезон"
          onChange={generateHandleChange('season')}
          options={seasonOptions}
          className="flex-[1]"
        />
        <AnimeSelect
          value={serie}
          placeholder="Серия"
          onChange={generateHandleChange('serie')}
          options={seriesOptions}
          className="flex-[1]"
        />
      </div>

      <div className="flex gap-2 px-2 pt-2 [grid-area:types]">
        <AnimeSelect
          value={dubType}
          placeholder="Тип"
          onChange={generateHandleChange('dubType')}
          options={dubTypeOptions}
          className="flex-[1]"
        />
        <AnimeSelect
          value={dub}
          placeholder="Озвучка"
          onChange={generateHandleChange('dub')}
          options={dubsOptions}
          className="flex-[1]"
        />
      </div>
      <iframe
        allowFullScreen
        src={url ?? ''}
        className="player-frame aspect-video w-full [grid-area:content]"
        frameBorder="0"
      />
    </div>
  );
};
