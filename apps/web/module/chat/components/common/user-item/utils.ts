import { MessageUserSchema } from 'module/chat/model/types';

export const chatMemberRoleToText = (role: MessageUserSchema['role']) => {
  switch (role) {
    case 'creator':
      return 'Создатель';
    case 'moderator':
      return 'Админ';
    case 'member':
      return 'Участник';
    default:
      return role;
  }
};
