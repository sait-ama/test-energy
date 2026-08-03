import { isRoleCreator, isRoleNotEqual, ROLES, UserRole } from '~entities/guild/lib/access';
import { SiteConfig } from '~shared/config/constants';
import { Features } from '~shared/config/feature-flags';

export type CommonAbilityParams = {
  features: SiteConfig['features'] | undefined;
  role: UserRole | null;
};
export namespace GuildByDirProfileAbilities {
  export const about = () => true;
  export const posts = ({ features }: Pick<CommonAbilityParams, 'features'>) =>
    !!features?.[Features.FORUM];
  export const requests = ({ role }: Pick<CommonAbilityParams, 'role'>) =>
    isRoleNotEqual({ role, targetRole: ROLES.MEMBER });
  export const upgrades = ({ role }: Pick<CommonAbilityParams, 'role'>) =>
    isRoleNotEqual({ role, targetRole: ROLES.MEMBER });
  export const boost = ({ role }: Pick<CommonAbilityParams, 'role'>) => isRoleCreator(role);
}

export const GuildByDirRequestsAbilities = {
  members: ({ role }: Pick<CommonAbilityParams, 'role'>) =>
    isRoleNotEqual({ role, targetRole: ROLES.MEMBER }),
  items: ({ role }: Pick<CommonAbilityParams, 'role'>) => isRoleCreator(role),
};
