import { useFormContext } from 'react-hook-form';

import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import { useRegister } from '~entities/user/model/mutations';
import { useAuthModal } from '~shared/lib/auth/use-auth-modal';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import type { AuthFormSchema } from '~widgets/auth/model/types';

import { CountdownButton } from './countdown-button';

export const RegisterSuccess = () => {
  const { close } = useAuthModal();
  const { getValues } = useFormContext<AuthFormSchema>();
  const { mutateAsync: resendEmail } = useRegister();

  const handleResendEmail = async (restartTimer: VoidFunction) => {
    const { confirm_password, password, email, username } = getValues('fields.register');

    try {
      await resendEmail({ confirm_password, password, email, username });
      restartTimer();
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <ReText size="md" align="center" weight="semibold">
        Регистрация успешна!
      </ReText>
      <ReText align="center" size="sm" weight="medium">
        Осталось только подтвердить почту. Мы отправили вам письмо ❤️
      </ReText>
      <ReText align="center" size="sm" color="muted-foreground" weight="medium">
        Не пришло письмо? <CountdownButton onClick={handleResendEmail} />
      </ReText>
      <Button
        type="button"
        variant="default"
        size="lg"
        onClick={() => {
          close();
        }}
      >
        Понял
      </Button>
    </div>
  );
};
