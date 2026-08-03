import type { DetailedCurrentUserSchema } from '~shared/api/models/user';

export const createCookieUser = (user: DetailedCurrentUserSchema) => {
  if (!user) return user;

  return {
    id: user.id,
    username: user.username,
    frame: user.frame,
    avatar: user.avatar,
    email: user.email,
    is_staff: user.is_staff,
    is_superuser: user.is_superuser,
    is_premium: user.is_premium,
    can_buy_premium_type: user.can_buy_premium_type,
  };
};
