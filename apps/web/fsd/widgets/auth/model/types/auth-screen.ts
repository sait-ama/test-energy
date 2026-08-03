export const enum AuthScreen {
  RESET_PASSWORD = 'password-recovery',
  RESET_PASSWORD_EMAIL_SENDED = 'password-recovery-email-sended',
  LOGIN = 'login',
  LOGIN_TWO_FACTOR = 'login-two-factor',
  REGISTER = 'register',
  REGISTER_SUCCESS = 'register-success',
}

// hack
export type AuthScreenUnion =
  | 'password-recovery'
  | 'password-recovery-email-sended'
  | 'login'
  | 'login-two-factor'
  | 'register'
  | 'register-success';
