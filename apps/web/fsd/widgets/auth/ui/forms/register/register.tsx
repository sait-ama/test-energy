import { useFormContext } from 'react-hook-form';
import Link from 'next/link';

import Mail from '@re/ui-kit/icons/mail';
import Password from '@re/ui-kit/icons/password';
import User from '@re/ui-kit/icons/user';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import { UTM_FIELD_NAME } from '~entities/analytics/model/const';
import { useRegister } from '~entities/user/model/mutations';
import { SocialLogin } from '~features/auth/ui/social-login';
import { SocialProviders } from '~shared/api/models/user';
import { FeatureFlagBoundary, Features } from '~shared/config/feature-flags';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { Captcha, useCaptcha, useCaptchaStrategy } from '~shared/ui/captcha';
import { FormControl, FormField, FormItem, FormMessage } from '~shared/ui/form';
import { HorizontalBreak } from '~shared/ui/horizonal-break';
import { Input } from '~shared/ui/input';
import { LinkBase } from '~shared/ui/link-base';
import { CookieService } from '~shared/utils/cookie-service';
import { isJson } from '~shared/utils/is-json';

import type { AuthFormSchema } from '../../../model/types';
import { AuthScreen } from '../../../model/types';

const excludedSocialProviders = [SocialProviders.DISCORD];

export const Register = () => {
  const { control, setValue, setError, resetField, getValues } = useFormContext<AuthFormSchema>();
  const { mutateAsync: registerUser, isPending } = useRegister();
  const captchaStrategy = useCaptchaStrategy();
  const captcha = useCaptcha(captchaStrategy.strategy);

  const handleNextStep = async () => {
    let captchaToken: string | undefined | null = 'WITHOUT_TOKEN';

    captchaToken = await captcha.actions.getToken();

    if (!captchaToken) {
      setError('fields.register.username', { type: 'server', message: 'Не пройдена Captcha.' });
      return;
    }

    const { username, email, password, confirm_password } = getValues('fields.register');
    const cookies = CookieService.getAll();
    const { referral } = cookies;
    const utm = isJson(cookies[UTM_FIELD_NAME]) ? JSON.parse(cookies[UTM_FIELD_NAME]!) : {};

    try {
      await registerUser({
        username,
        email,
        password,
        confirm_password,
        [captchaStrategy.key]: captchaToken,
        referral,
        ...utm,
      });
      setValue('form', AuthScreen.REGISTER_SUCCESS);
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
      captcha.actions.reset();
    }
  };

  return (
    <form className="flex flex-col gap-5">
      <ReText size="md" align="center" weight="semibold">
        Зарегистрировать аккаунт
      </ReText>
      <FeatureFlagBoundary name={Features.REGISTER_BY_MAIL}>
        <div className="flex flex-col gap-3">
          <FormField
            control={control}
            name="fields.register.username"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    startIcon={<User color="primary" />}
                    placeholder="*Никнейм"
                    type="text"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="fields.register.email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} startIcon={<Mail />} placeholder="*Почта" type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="fields.register.password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    startIcon={<Password color="primary" />}
                    placeholder="*Пароль"
                    type="password"
                    autoComplete="off"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="fields.register.confirm_password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    startIcon={<Password color="primary" />}
                    placeholder="**Пароль еще раз"
                    type="password"
                    autoComplete="off"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Captcha strategy={captchaStrategy.strategy} {...captcha.data} {...captcha.state} />
        </div>
        <Button variant="default" size="lg" onClick={handleNextStep} disabled={isPending}>
          Регистрация
        </Button>
        <HorizontalBreak />
      </FeatureFlagBoundary>
      <SocialLogin exclude={excludedSocialProviders} />

      <ReText align="center" size="sm" color="muted-foreground" weight="medium">
        Уже есть аккаунт?&nbsp;
        <LinkBase>
          <ReText
            size="sm"
            component="span"
            weight="semibold"
            onClick={() => {
              setValue('form', AuthScreen.LOGIN);
              resetField('fields.login');
            }}
          >
            Войти
          </ReText>
        </LinkBase>
      </ReText>

      <ReText size="xs" color="muted-foreground" weight="medium" align="center">
        Нажимая «Регистрация», вы принимаете&nbsp;
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
        &nbsp; и&nbsp;
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
