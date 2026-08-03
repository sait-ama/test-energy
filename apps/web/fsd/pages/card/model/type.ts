import type { Type } from '~shared/api/models/forms';
import { SearchField, SearchField as SearchFieldEnum } from '~shared/api/models/search';

export interface FilterSchema<T = unknown> {
  key: string;
  name: string;
  field: string;
  type: string;
  logged?: boolean;
  excludable?: boolean;
  transform?: (item: T) => Type;
  searchField?: SearchFieldEnum;
}
export class FilterSchemaBuilder<T> implements FilterSchema<T> {
  excludable: boolean;
  field: string;
  transform?: FilterSchema<T>['transform'];
  key: string;
  logged: boolean;
  name: string;
  searchField?: SearchField;

  type: string;

  constructor({
    excludable,
    key,
    transform,
    logged,
    name,
    type,
    searchField,
    field,
  }: FilterSchema<T>) {
    this.excludable = !!excludable;
    this.field = field;
    this.key = key;
    this.transform = transform;
    this.logged = !!logged;
    this.name = name;
    this.searchField = searchField;
    this.type = type;
  }
}
