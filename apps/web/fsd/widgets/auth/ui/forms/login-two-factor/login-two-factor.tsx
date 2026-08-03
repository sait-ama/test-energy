'use client';

import { FormEventHandler, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { Button } from '@re/ui-kit/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@re/ui-kit/ui/select';
import { ReText } from '@re/ui-kit/ui/text';

import { AuthService } from '~entities/user/model/lib';
import { useLoginTwoFactor, useSendTwoFactorCodeEmail } from '~entities/user/model/mutations';
import { useAuthModal } from '~shared/lib/auth/use-auth-modal';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { FormControl, FormField, FormItem, FormMessage } from '~shared/ui/form';
import { InputOtp, InputOtpGroup, InputOtpSlot } from '~shared/ui/input-otp';

import type { AuthFormSchema } from '../../../model/types';

export const LoginTwoFactor = () => {
  const { getValues, control, trigger, clearErrors } = useFormContext<AuthFormSchema>();
  const {
    mutateAsync: sendCode,
    isPending: isCodeSending,
    isSuccess: isCodeSent,
  } = useSendTwoFactorCodeEmail();
  const { mutateAsync: login, isPending: isLoginPending } = useLoginTwoFactor();
  const methods = getValues('fields.login-two-factor.allowed-methods');
  const { close: closeAuthModal, onSuccess } = useAuthModal();
  const prevValues = useRef<{
    method: AuthFormSchema['fields']['login-two-factor']['method'] | null;
  }>({
    method: null,
  }).current;

  const [sentMessage, setSentMessage] = useState<string | null>(null);

  const handleSendCode = async () => {
    const { method: prevMethod } = prevValues;

    const method = getValues('fields.login-two-factor.method');

    if (prevMethod === method) return;
    prevValues.method = method;

    const { user, password } = getValues('fields.login');

    const body = {
      method: method,
      user,
      password,
    };

    try {
      clearErrors();
      const res = await sendCode(body);

      setSentMessage(res?.content?.msg ?? null);
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  const handleLogin: FormEventHandler<HTMLFormElement> = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    const isDataValid = await trigger('fields.login-two-factor.code');

    if (!isDataValid) return;

    const { user, password } = getValues('fields.login');
    const { code } = getValues('fields.login-two-factor');

    try {
      clearErrors();
      const response = await login({ user, password, code });
      const data = response.content;

      const { access_token, ...pureUser } = data;
      await AuthService.login({ token: access_token, user: pureUser });
      if (onSuccess) onSuccess();
      closeAuthModal();
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-5">
      <ReText size="md" component="h5" align="center">
        Войти в аккаунт
      </ReText>
      {sentMessage ? (
        <ReText component="p" size="xs" color="muted-foreground" align="center">
          {sentMessage}
        </ReText>
      ) : null}
      <div className="flex flex-col gap-3 py-4">
        <FormField
          control={control}
          name="fields.login-two-factor.method"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleSendCode();
                  }}
                  disabled={isCodeSending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Методы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {methods.map(({ name, type }) => (
                        <SelectItem key={type} value={type}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isCodeSent ? (
          <div className="flex flex-col gap-3">
            <FormField
              control={control}
              name="fields.login-two-factor.code"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputOtp {...field} maxLength={6}>
                      <InputOtpGroup>
                        {Array.from({ length: 6 }).map((_, i) => (
                          <InputOtpSlot key={i} index={i} />
                        ))}
                      </InputOtpGroup>
                    </InputOtp>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" variant="default" size="lg" disabled={isLoginPending}>
              Войти
            </Button>
          </div>
        ) : null}
      </div>
    </form>
  );
};
