import { Routing } from '~shared/config/routing';

export const segments: Routing.Club.ByDirRouteVariables['params']['tab'][] = [
  'about',
  'boost',
  'requests',
  'posts',
];

export const segmentsRequests: Routing.Club.RequestsByDirRouteVariables['params']['tab'][] = [
  'members',
  'items',
];
