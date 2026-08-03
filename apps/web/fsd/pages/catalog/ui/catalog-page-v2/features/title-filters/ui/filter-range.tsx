import { Button } from '@re/ui-kit/ui/button';
import { Input } from '@re/ui-kit/ui/input';
import { cn } from '@re/ui-kit/utils/cn';

import type { RangeFilterType } from '~shared/lib/filters';

import { useTitleFiltersField } from '../model/context';
import type { TitleFiltersSchema } from '../model/schema';

export type RangeFilterProps = {
  className?: string;
  schema: RangeFilterType;
  value: { min: number | null; max: number | null };
  onChange: (value: { min: number | null; max: number | null }) => void;
};

export const RangeFilter = (props: RangeFilterProps) => {
  const { className, schema, value, onChange } = props;

  const handleChange = (newValue: { min: number | null; max: number | null }) => {
    onChange(newValue);
  };

  const handlePresetClick = (presetValue: { min: number | null; max: number | null }) => {
    onChange(presetValue);
  };

  const inputClassName = 'h-8 py-1.5 px-1.5 bg-accent/70';

  return (
    <div className={cn('bg-secondary flex w-full flex-col gap-2 rounded-md px-4 py-3', className)}>
      <div className="text-foreground ml-1 text-sm font-semibold">{schema.label}</div>
      <div className="flex w-full gap-2">
        <Input
          type="number"
          value={value.min ?? ''}
          placeholder="От"
          onChange={(e) => handleChange({ ...value, min: e.target.valueAsNumber || null })}
          min={schema.min}
          max={value.max ?? schema.max}
          step={schema.step || 1}
          className={inputClassName}
        />
        <Input
          type="number"
          value={value.max ?? ''}
          placeholder="До"
          onChange={(e) => handleChange({ ...value, max: e.target.valueAsNumber || null })}
          min={value.min ?? schema.min}
          max={schema.max}
          step={schema.step || 1}
          className={inputClassName}
        />
      </div>
      {schema.options && schema.options.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {schema.options.map((option) => (
            <Button
              key={option.label}
              variant="outline"
              size="sm"
              disabled={option.disabled}
              onClick={() => handlePresetClick(option.value)}
              title={option.description}
              className="h-7 px-2 text-xs"
            >
              {option.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

const useRangeFilter = (fieldName: keyof TitleFiltersSchema) => {
  const { schema, value, onChange } = useTitleFiltersField(fieldName);
  return { schema: schema as RangeFilterType, value, onChange };
};

export const LastChapterUploadedRangeFilter = () => {
  const { schema, value, onChange } = useRangeFilter('last_chapter_uploaded');

  return <RangeFilter schema={schema} value={value} onChange={onChange} />;
};

export const CountChaptersRangeFilter = () => {
  const { schema, value, onChange } = useRangeFilter('count_chapters');

  return <RangeFilter schema={schema} value={value} onChange={onChange} />;
};

export const IssueYearRangeFilter = () => {
  const { schema, value, onChange } = useRangeFilter('issue_year');

  return <RangeFilter schema={schema} value={value} onChange={onChange} />;
};

export const RatingRangeFilter = () => {
  const { schema, value, onChange } = useRangeFilter('rating');

  return <RangeFilter schema={schema} value={value} onChange={onChange} />;
};
