import { useFormContext } from 'react-hook-form';

import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import { useSendPasswordRecoveryEmail } from '~entities/user/model/mutations';
import { useAuthModal } from '~shared/lib/auth/use-auth-modal';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';

import type { AuthFormSchema } from '../../model/types';
import { CountdownButton } from './countdown-button';

export const PasswordRecoveryEmailSent = () => {
  const { close } = useAuthModal();

  const {
    getValues,
    formState: { errors },
  } = useFormContext<AuthFormSchema>();
  const { mutateAsync: resendEmail } = useSendPasswordRecoveryEmail();
  const serverError = errors.root?.['password-recovery-email-sended']?.message;

  const handleSendAgain = async (restartTimer: () => void) => {
    const { email } = getValues('fields.password-recovery');

    try {
      await resendEmail({ email });
      restartTimer();
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  return (
    <form className="flex flex-col gap-5">
      <ReText size="md" align="center" weight="semibold">
        Письмо отправлено
      </ReText>
      <ReText align="center" size="sm" weight="medium">
        На ваш адрес электронной почты было отправлено письмо с инструкциями о том, как сбросить
        пароль. Если вы не получите его в течение нескольких минут, убедитесь, что вы указали адрес
        электронной почты для своей учётной записи, и повторите попытку или обратитесь к нам за
        помощью
      </ReText>
      {serverError ? (
        <ReText align="center" size="sm" color="destructive" weight="medium">
          {serverError}
        </ReText>
      ) : null}
      <ReText
        align="center"
        size="sm"
        color={serverError ? 'destructive' : 'muted-foreground'}
        weight="medium"
      >
        {serverError ? '' : 'Не пришло письмо?'} <CountdownButton onClick={handleSendAgain} />
      </ReText>
      <Button
        variant="default"
        size="lg"
        onClick={() => {
          close();
        }}
      >
        Понял
      </Button>
    </form>
  );
};
