import { Button } from '@re/ui-kit/ui/button';

import { AuthTypes } from '~shared/api/models/auth';
import { useAuthModal } from '~shared/lib/auth/use-auth-modal';

interface AuthButtonProps {
  onSuccess?: () => void;
}

export const AuthButton = (props: AuthButtonProps) => {
  const { onSuccess } = props;
  const { open: openAuthModal } = useAuthModal();

  return (
    <div className="flex flex-col flex-wrap items-center gap-2 md:flex-row">
      <Button
        onClick={() => {
          openAuthModal({ authType: AuthTypes.LOGIN, onSuccess });
        }}
      >
        Войти в аккаунт
      </Button>
      или
      <Button
        onClick={() => {
          openAuthModal({
            authType: AuthTypes.REGISTER,
            onSuccess,
          });
        }}
      >
        Зарегистрироваться
      </Button>
    </div>
  );
};
