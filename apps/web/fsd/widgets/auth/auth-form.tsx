import { useFormContext, useWatch } from 'react-hook-form';

import type { AuthFormSchema } from './model/types';
import { AuthScreen } from './model/types';
import {
  Login,
  LoginTwoFactor,
  PasswordRecoveryEmailSent,
  PasswordRecoveryRequest,
  Register,
  RegisterSuccess,
} from './ui/forms';

export const AuthForm = () => {
  const { control } = useFormContext<AuthFormSchema>();

  const form = useWatch({ name: 'form', control });

  return (
    <>
      {form === AuthScreen.LOGIN ? <Login /> : null}
      {form === AuthScreen.LOGIN_TWO_FACTOR ? <LoginTwoFactor /> : null}
      {form === AuthScreen.REGISTER ? <Register /> : null}
      {form === AuthScreen.REGISTER_SUCCESS ? <RegisterSuccess /> : null}
      {form === AuthScreen.RESET_PASSWORD ? <PasswordRecoveryRequest /> : null}
      {form === AuthScreen.RESET_PASSWORD_EMAIL_SENDED ? <PasswordRecoveryEmailSent /> : null}
    </>
  );
};
