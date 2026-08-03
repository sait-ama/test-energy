'use client';

import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { Dialog, DialogContent, DialogTitle } from '@re/ui-kit/ui/dialog';

import { useAuthModal } from '~shared/lib/auth/use-auth-modal';
import { Form, useForm } from '~shared/ui/form';

import { AuthFormValidator, AuthScreen } from './model/types';
import { AuthForm } from './auth-form';

export const AuthModal = () => {
  const { isOpen, close, authType } = useAuthModal();
  const t = useTranslations('auth');

  const form = useForm({
    schema: AuthFormValidator(t),
    defaultValues: {
      form: authType,
      fields: {
        [AuthScreen.LOGIN]: {},
        [AuthScreen.REGISTER]: {},
        [AuthScreen.RESET_PASSWORD]: {},
        [AuthScreen.LOGIN_TWO_FACTOR]: {},
      },
    },
  });

  const handleClose = () => {
    close();
    form.reset();
  };

  const type = form.watch('form');

  // костыль, radix dialog вешает pointer-events и рекапча не работает :((
  useEffect(() => {
    setTimeout(() => (document.body.style.pointerEvents = ''));
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(value) => !value && handleClose()}>
      <DialogContent className="cs-auth-modal sm:max-w-[380px]" data-form={type}>
        <DialogTitle className="sr-only">Форма авторизации</DialogTitle>

        <Form {...form}>
          <AuthForm />
        </Form>
      </DialogContent>
    </Dialog>
  );
};
