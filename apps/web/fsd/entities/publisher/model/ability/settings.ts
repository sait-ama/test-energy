import { defineAbility } from '@casl/ability';

import type { PublisherResponseSchema } from '~shared/api/models/publisher';
import type { DetailedCurrentUserSchema } from '~shared/api/models/user';
import type { Ability, AbilityBuilder, RE_CRUD } from '~shared/lib/ability-v2/Ability';

export type PublisherSettingsAbility = [
  RE_CRUD,
  'monetization' | 'something' | 'profile' | 'members' | 'documents' | 'social',
];

export class PublisherSettingsAbilityBuilder implements AbilityBuilder<PublisherSettingsAbility> {
  constructor({
    publisher,
    session,
  }: {
    publisher: PublisherResponseSchema | undefined;
    session: DetailedCurrentUserSchema | null;
  }) {
    this._publisher = publisher;
    this._session = session;
  }

  private _publisher: PublisherResponseSchema | undefined;

  get publisher(): PublisherResponseSchema | undefined {
    return this._publisher;
  }

  set publisher(value: PublisherResponseSchema | undefined) {
    this._publisher = value;
  }

  private _session: DetailedCurrentUserSchema | null;

  get session(): DetailedCurrentUserSchema | null {
    return this._session;
  }

  set session(value: DetailedCurrentUserSchema | null) {
    this._session = value;
  }

  build(): Ability<PublisherSettingsAbility> {
    return defineAbility<Ability<PublisherSettingsAbility>>((can, cannot) => {
      if (!this._session) return;
      const { is_staff } = this._session;
      const {
        props: {
          can_manage_members = false,
          can_sign_contract = false,
          is_member = false,
          can_update = false,
          can_withdraw_money = false,
        } = {},
      } = this._publisher ?? {};
      if (can_withdraw_money || can_sign_contract) {
        can(['write', 'read', 'create', 'delete'], ['something', 'monetization', 'documents']);
      }
      if (!is_member || (!can_update && !is_staff)) {
        cannot(['read', 'write', 'delete', 'create'], ['profile']);
        return;
      }
      if (is_member || is_staff) {
        can('read', 'something');
      }
      if (can_withdraw_money && can_sign_contract) {
        can(['write', 'read', 'create', 'delete'], ['something', 'monetization', 'documents']);
      }
      if (is_staff || can_update) {
        can(['read', 'write', 'delete', 'create'], ['something', 'profile', 'social']);
      }

      if (can_manage_members || is_staff) {
        can(['write', 'create', 'delete', 'read'], 'members');
      }
      if (is_member) {
        can(['read', 'write'], ['profile', 'social']);
      }
    });
  }
}
