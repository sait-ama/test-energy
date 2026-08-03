import { AbilityTuple, MongoAbility } from '@casl/ability';
import type { MongoQuery } from '@ucast/mongo';

export type Ability<T extends AbilityTuple, G extends MongoQuery = any> = MongoAbility<T, G>;

export interface AbilityBuilder<
  AbilityType extends AbilityTuple,
  G extends MongoQuery = MongoQuery,
> {
  build(): Ability<AbilityType, G>;
}

export type RE_CRUD<T extends string = never> =
  | ('write' | 'read' | 'delete' | 'create')
  | (T extends string ? T : 'write');
