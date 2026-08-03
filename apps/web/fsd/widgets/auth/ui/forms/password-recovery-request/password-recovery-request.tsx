import { FormEventHandler } from 'react';
import { useFormContext } from 'react-hook-form';

import Mail from '@re/ui-kit/icons/mail';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import { useSendPasswordRecoveryEmail } from '~entities/user/model/mutations';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { Captcha, useCaptcha, useCaptchaStrategy } from '~shared/ui/captcha';
import { FormControl, FormField, FormItem, FormMessage } from '~shared/ui/form';
import { Input } from '~shared/ui/input';
import { LinkBase } from '~shared/ui/link-base';

import type { AuthFormSchema } from '../../../model/types';
import { AuthScreen } from '../../../model/types';

export const PasswordRecoveryRequest = () => {
  const { control, setError, trigger, getValues, setValue } = useFormContext<AuthFormSchema>();
  const { mutateAsync: sendEmail, isPending } = useSendPasswordRecoveryEmail();
  const captchaStrategy = useCaptchaStrategy();
  const captcha = useCaptcha(captchaStrategy.strategy);

  const handleNextStep: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const captchaToken = await captcha.actions.getToken();

    if (!captchaToken) {
      setError('fields.password-recovery.email', {
        type: 'server',
        message: 'Не пройдена Captcha.',
      });
      return;
    }

    const isValid = await trigger('fields.password-recovery');
    if (!isValid) return;

    const { email } = getValues('fields.password-recovery');

    try {
      await sendEmail({ email, [captchaStrategy.key]: captchaToken });
      setValue('form', AuthScreen.RESET_PASSWORD_EMAIL_SENDED);
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
      captcha.actions.reset();
    }
  };

  return (
    <form onSubmit={handleNextStep} className="flex flex-col gap-5">
      <ReText size="md" align="center" weight="semibold">
        Забыли пароль?
      </ReText>
      <div className="flex flex-col gap-3">
        <FormField
          control={control}
          name="fields.password-recovery.email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  startIcon={<Mail color="primary" />}
                  placeholder="*Почта"
                  type="email"
                  autoComplete="email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Captcha strategy={captchaStrategy.strategy} {...captcha.data} {...captcha.state} />
      </div>

      <Button variant="default" size="lg" type="submit" disabled={isPending}>
        Отправить письмо
      </Button>

      <ReText align="center" size="sm" color="muted-foreground" weight="medium">
        Помните свой пароль?
        <LinkBase>
          <ReText
            size="sm"
            component="span"
            weight="semibold"
            onClick={() => {
              setValue('form', AuthScreen.LOGIN);
            }}
          >
            Войти
          </ReText>
        </LinkBase>
      </ReText>
    </form>
  );
};
