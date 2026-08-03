import { ROLES, UserRole } from '~entities/guild/lib/access';
import { Routing } from '~shared/config/routing';

type SegmentConfig = {
  segment: Routing.Club.SettingsByDirRouteVariables['params']['tab'];
  roles?: UserRole[];
};

export const segments: SegmentConfig[] = [
  { segment: 'about', roles: [ROLES.CREATOR, ROLES.ADMIN] },
  { segment: 'members', roles: [ROLES.CREATOR, ROLES.ADMIN] },
  { segment: 'donations', roles: [ROLES.CREATOR, ROLES.ADMIN] },
  { segment: 'destroy', roles: [ROLES.CREATOR] },
];
