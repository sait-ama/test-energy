import type {
  Field,
  PublisherStatisticResponseSchemaSerialized,
  StatSchema,
} from '~shared/api/models/publisher';

export interface ChartProps<TField extends Field> {
  fields: TField;
  onDataChange: (data: PublisherStatisticResponseSchemaSerialized['results'][TField]) => void;
  partials: Record<keyof StatSchema<TField>, { label: string; color: string }>;
}
