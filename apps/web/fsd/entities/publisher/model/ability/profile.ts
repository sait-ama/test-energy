import { defineAbility } from '@casl/ability';

import type {
  PublisherMemberDetailSchema,
  PublisherResponseSchema,
} from '~shared/api/models/publisher';
import type { DetailedCurrentUserSchema } from '~shared/api/models/user';
import type { Ability, AbilityBuilder, RE_CRUD } from '~shared/lib/ability-v2/Ability';

export type ProfileTab =
  | 'about'
  | 'titles'
  | 'feed'
  | 'advertisement'
  | 'comments'
  | 'strikes'
  | 'posts'
  | 'statistic';
export const allTabs = [
  'about',
  'titles',
  'feed',
  'advertisement',
  'comments',
  'strikes',
  'posts',
  'statistic',
] as ProfileTab[];
type PublisherDep = PublisherResponseSchema['props'];
export type RE_CRUD_PUBLISHER = RE_CRUD<'pin' | 'represent' | 'publish'>;
export type PublisherAbility = [RE_CRUD_PUBLISHER, ProfileTab];
type GetSubjectsForActionHandler = (rules: RE_CRUD_PUBLISHER) => ProfileTab[];

export class PublisherProfileAbilityBuilder implements AbilityBuilder<PublisherAbility> {
  constructor({
    publisherDep,
    session,
    sessionAsMember,
  }: {
    sessionAsMember?: PublisherMemberDetailSchema | undefined;
    publisherDep: PublisherDep | undefined;
    session: DetailedCurrentUserSchema | null;
  }) {
    this._publisherDep = publisherDep;
    this._session = session;
    this._sessionAsMember = sessionAsMember;
  }

  get sessionAsMember(): PublisherMemberDetailSchema | undefined {
    return this._sessionAsMember;
  }

  set sessionAsMember(value: PublisherMemberDetailSchema | undefined) {
    this._sessionAsMember = value;
  }

  private _publisherDep: PublisherDep | undefined;
  private _sessionAsMember?: PublisherMemberDetailSchema | undefined;

  get publisherDep(): PublisherDep | undefined {
    return this._publisherDep;
  }

  set publisherDep(value: PublisherDep | undefined) {
    this._publisherDep = value;
  }

  private _session: DetailedCurrentUserSchema | null;

  get session(): DetailedCurrentUserSchema | null {
    return this._session;
  }

  set session(value: DetailedCurrentUserSchema | null) {
    this._session = value;
  }

  build(): Ability<PublisherAbility> & { getSubjectsForAction: GetSubjectsForActionHandler } {
    const ability = defineAbility<Ability<PublisherAbility>>((can) => {
      can('read', ['about', 'titles', 'feed', 'comments', 'posts']);
      const asMember = this.sessionAsMember;
      if (asMember) {
        for (const right of asMember.rights) {
          const [_, action, subject] = right.split('_') as [
            'can',
            'view' | 'create' | 'add',
            ProfileTab,
          ];
          if (action === 'view' && subject) {
            can('read', subject);
          }
        }
      }
    });

    //todo why did i state it here? - Idk
    Reflect.defineProperty(ability, 'getSubjectsForAction', {
      value: (action: RE_CRUD): ProfileTab[] => {
        return allTabs.filter((subject) => ability.can(action, subject));
      },
      writable: false,
      enumerable: false,
      configurable: false,
    });

    return ability as typeof ability & { getSubjectsForAction: GetSubjectsForActionHandler };
  }
}
