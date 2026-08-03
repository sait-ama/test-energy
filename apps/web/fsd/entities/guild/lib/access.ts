import { ClubMemberRoleEnum } from '@re/api/generated/types.gen';

export type UserRole = ClubMemberRoleEnum | null | undefined;

export enum ROLES {
  CREATOR = 'creator',
  ADMIN = 'admin',
  MEMBER = 'member',
}

export function isHasRole(role: UserRole) {
  return !!role;
}

export function isRoleEqual({
  role,
  targetRole,
}: {
  role: UserRole;
  targetRole: ClubMemberRoleEnum;
}) {
  return isHasRole(role) && role === targetRole;
}

export function isRoleNotEqual({
  role,
  targetRole,
}: {
  role: UserRole;
  targetRole: ClubMemberRoleEnum;
}) {
  return isHasRole(role) && role !== targetRole;
}

export function isRoleIn({
  role,
  targetRoles,
}: {
  role: UserRole;
  targetRoles: ClubMemberRoleEnum[];
}) {
  return isHasRole(role) && targetRoles.includes(role);
}

export function isRoleMember(role: UserRole) {
  return isRoleEqual({ role, targetRole: ROLES.MEMBER });
}

export function isRoleCreator(role: UserRole) {
  return isRoleEqual({ role, targetRole: ROLES.CREATOR });
}

export function isRoleAdmin(role: UserRole) {
  return isRoleEqual({ role, targetRole: ROLES.ADMIN });
}
