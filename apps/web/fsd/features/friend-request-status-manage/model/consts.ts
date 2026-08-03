import { FriendRequestStatusEnum } from '~shared/api/models/friend';
//* `1` - На рассмотрении
// * `2` - Принят
// * `3` - Отклонен
// * `4` - Отменен
export const config = {
  [FriendRequestStatusEnum.ACCEPTED]: {
    from: [],
    to: [],
  },
  [FriendRequestStatusEnum.CANCELED_BY_TO]: {
    from: [],
    to: [FriendRequestStatusEnum.ACCEPTED],
  },
  [FriendRequestStatusEnum.CANCELED_BY_FROM]: {
    to: [],
    from: [FriendRequestStatusEnum.WAITING],
  },
  [FriendRequestStatusEnum.WAITING]: {
    to: [FriendRequestStatusEnum.ACCEPTED, FriendRequestStatusEnum.CANCELED_BY_TO],
    from: [FriendRequestStatusEnum.CANCELED_BY_FROM],
  },
} satisfies Record<FriendRequestStatusEnum, Record<'from' | 'to', FriendRequestStatusEnum[]>>;
