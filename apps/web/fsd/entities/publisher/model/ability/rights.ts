import { defineAbility } from '@casl/ability';
import pick from 'lodash.pick';

import type {
  PublisherMemberDetailSchema,
  PublisherResponseSchema,
} from '~shared/api/models/publisher';
import { PublisherRights, RoleMembers } from '~shared/api/models/publisher';
import type { DetailedCurrentUserSchema } from '~shared/api/models/user';
import { Features } from '~shared/config/feature-flags';
import type { Ability, AbilityBuilder, RE_CRUD } from '~shared/lib/ability-v2/Ability';

export type RE_CRUD_PUBLISHER = RE_CRUD<'pin' | 'represent' | 'publish'>;

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
export type PublisherAbility = [RE_CRUD_PUBLISHER, ProfileTab];
type GetSubjectsForActionHandler = (rules: RE_CRUD_PUBLISHER) => ProfileTab[];
const Actions = {
  view: 'read',
  update: 'write',
  delete: 'delete',
  create: 'create',
  make: 'create',
  read: 'read',
  manage: 'write',
  edit: 'write',
  invite: 'create',
  add: 'create',
};
export class PublisherProfileAbilityBuilder implements AbilityBuilder<PublisherAbility> {
  constructor({
    publisherDep,
    session,
    sessionAsMember,
    feats,
  }: {
    sessionAsMember?: PublisherMemberDetailSchema | undefined;
    publisherDep: PublisherDep | undefined;
    session: DetailedCurrentUserSchema | null;
    feats?: Record<Features, boolean>;
  }) {
    this._publisherDep = publisherDep;
    this._session = session;
    this._sessionAsMember = sessionAsMember;
    this._feats = feats;
  }

  get sessionAsMember(): PublisherMemberDetailSchema | undefined {
    return this._sessionAsMember;
  }

  set sessionAsMember(value: PublisherMemberDetailSchema | undefined) {
    this._sessionAsMember = value;
  }
  get feats(): Record<Features, boolean> | undefined {
    return this._feats;
  }

  set feats(value: Record<Features, boolean> | undefined) {
    this._feats = value;
  }
  private _publisherDep: PublisherDep | undefined;
  private _sessionAsMember?: PublisherMemberDetailSchema | undefined;
  private _feats?: Record<Features, boolean> | undefined;

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
      can('read', ['about', 'titles', 'feed', 'comments']);
      if (this.feats && this.feats[Features.FORUM]) {
        can('read', 'posts');
      }
      const asMember = this?.sessionAsMember;
      const rights = [
        ...(asMember?.rights || []),
        ...Object.keys(pick(this.publisherDep || {}, asMember?.rights || [])),
      ];
      if (asMember) {
        for (const right of rights) {
          const subjectRight = right.split('_');
          const [_, action, ...other] = subjectRight as ['can', RE_CRUD<string>, string[]];
          // @ts-ignore
          can(Actions?.[action] || action, other.join('_'));
        }
      }

      if (
        (this.session && this.publisherDep?.can_watch_statistic) ||
        this.sessionAsMember?.rights.includes(PublisherRights.CAN_VIEW_STATISTICS) ||
        this.sessionAsMember?.role === RoleMembers.CREATOR ||
        this.session?.is_staff
      )
        can(['read', 'write', 'delete', 'create'], allTabs);
      if (this.sessionAsMember?.rights.includes(PublisherRights.CAN_VIEW_STRIKES)) {
        can('read', 'strikes');
      }
    });
    Reflect.defineProperty(ability, 'getSubjectsForAction', {
      value: (action: RE_CRUD<string>): ProfileTab[] => {
        // @ts-ignore
        return allTabs.filter((subject) => ability.can(action, subject));
      },
    });
    return ability as typeof ability & { getSubjectsForAction: GetSubjectsForActionHandler };
  }
}
