import { useActivityItemContext } from '~entities/activity/model/context';
import { useSession } from '~shared/lib/session/use-session';

// todo: rewrite to ability
const ModeratorOnly = ({ children }) => {
  const user = useSession();

  return user?.is_staff ? children : null;
};

const OwnerOnly = ({ children }) => {
  const user = useSession();
  const { data } = useActivityItemContext();

  return user?.id === data.user.id ? children : null;
};

const NotOwner = ({ children }) => {
  const user = useSession();
  const { data } = useActivityItemContext();

  return user?.id !== data.user.id ? children : null;
};

const VisibilityControl = Object.assign(
  {},
  {
    ModeratorOnly,
    OwnerOnly,
    NotOwner,
  }
);

export { VisibilityControl };
