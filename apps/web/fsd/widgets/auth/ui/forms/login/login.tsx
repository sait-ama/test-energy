import { FormEventHandler } from 'react';
import { useFormContext } from 'react-hook-form';
import Link from 'next/link';

import Mail from '@re/ui-kit/icons/mail';
import Password from '@re/ui-kit/icons/password';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import { AuthService } from '~entities/user/model/lib';
import { useLogin } from '~entities/user/model/mutations';
import { SocialLogin } from '~features/auth/ui/social-login';
import { SocialProviders } from '~shared/api/models/user';
import { useAuthModal } from '~shared/lib/auth/use-auth-modal';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { useCaptcha, useCaptchaStrategy } from '~shared/ui/captcha';
import { FormControl, FormField, FormItem, FormMessage } from '~shared/ui/form';
import { HorizontalBreak } from '~shared/ui/horizonal-break';
import { Input } from '~shared/ui/input';
import { LinkBase } from '~shared/ui/link-base';

import type { AuthFormSchema } from '../../../model/types';
import { AuthScreen } from '../../../model/types';

export const Login = () => {
  const { control, trigger, setValue, resetField, getValues } = useFormContext<AuthFormSchema>();
  const { mutateAsync: login, isPending } = useLogin();
  const { close: closeAuthModal, onSuccess } = useAuthModal();
  const captchaStrategy = useCaptchaStrategy();
  const captcha = useCaptcha(captchaStrategy.strategy);

  const handleNextStep: FormEventHandler<HTMLFormElement> = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    const { user, password } = getValues('fields.login');

    if (!(await trigger('fields.login'))) return;

    // const captchaToken = await captcha.actions.getToken();

    // if (!captchaToken) {
    //   setError('fields.login.user', {
    //     type: 'manual',
    //     message: 'Не пройдена капча',
    //   });
    //
    //   return;
    // }

    try {
      const response = await login({
        user,
        password,

        // [captchaStrategy.key]: captchaToken
      });

      if (response.content.two_factor_auth) {
        setValue('form', AuthScreen.LOGIN_TWO_FACTOR);
        setValue('fields.login-two-factor.allowed-methods', response.content.methods);
      } else {
        const { access_token, ...user } = response.content;
        await AuthService.login({ token: access_token, user });

        if (onSuccess) onSuccess();
        closeAuthModal();
      }
    } catch (e: unknown) {
      logger.error(e);

      await resolveErrorAsync(e);
      captcha.actions.reset();
    }
  };

  return (
    <form onSubmit={handleNextStep} className="flex flex-col gap-5">
      <ReText size="md" align="center" weight="semibold">
        Войти в аккаунт
      </ReText>
      <div className="flex flex-col gap-3">
        <FormField
          control={control}
          name="fields.login.user"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  startIcon={<Mail color="primary" />}
                  defaultValue=""
                  placeholder="*Логин/почта"
                  type="text"
                  autoComplete="username"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="fields.login.password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  startIcon={<Password color="primary" />}
                  placeholder="*Пароль"
                  defaultValue=""
                  autoComplete="current-password"
                  type="password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/*<Captcha strategy={captchaStrategy.strategy} {...captcha.data} {...captcha.state} />*/}
      </div>
      <div className="flex flex-col gap-3">
        <Button type="submit" variant="default" size="lg" disabled={isPending}>
          Войти
        </Button>

        <LinkBase>
          <ReText
            onClick={() => {
              setValue('form', AuthScreen.RESET_PASSWORD);
              resetField('fields.login');
            }}
            component="span"
            size="sm"
            align="center"
            weight="semibold"
          >
            Забыли пароль?
          </ReText>
        </LinkBase>
      </div>
      <HorizontalBreak />
      <SocialLogin exclude={[SocialProviders.DISCORD]} />

      <ReText align="center" size="sm" color="muted-foreground" weight="medium">
        Нет учетной записи?&nbsp;
        <LinkBase>
          <ReText
            size="sm"
            component="span"
            weight="semibold"
            onClick={() => {
              setValue('form', AuthScreen.REGISTER);
              resetField('fields.register');
            }}
          >
            Зарегистрироваться
          </ReText>
        </LinkBase>
      </ReText>

      <ReText size="xs" color="muted-foreground" weight="medium" align="center">
        Нажимая «Войти», вы принимаете&nbsp;
        <LinkBase>
          <Link
            shallow={false}
            prefetch={false}
            href="/terms-of-use"
            color="accent"
            target="_blank"
          >
            пользовательское соглашение
          </Link>
        </LinkBase>
        &nbsp;и&nbsp;
        <LinkBase>
          <Link
            shallow={false}
            prefetch={false}
            href="/confidentiality-agreement"
            color="accent"
            target="_blank"
          >
            политику конфиденциальности
          </Link>
        </LinkBase>
      </ReText>
    </form>
  );
};
