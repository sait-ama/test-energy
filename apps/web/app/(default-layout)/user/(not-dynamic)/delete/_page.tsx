'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { useRouter } from '@bprogress/next';
import { captureException } from '@sentry/nextjs';
import { z } from 'zod';

import { Button } from '@re/ui-kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@re/ui-kit/ui/dialog';
import { ReText } from '@re/ui-kit/ui/text';

import { AuthService } from '~entities/user/model/lib';
import { UserRepository } from '~entities/user/model/repository';
import { Routing } from '~shared/config/routing';
import { useSession } from '~shared/lib/session/use-session';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from '~shared/ui/form';
import { Input } from '~shared/ui/input';
import { linkBaseVariants } from '~shared/ui/link-base';
import { Section } from '~shared/ui/section';
import { importToastAsync } from '~shared/ui/toast/toast.async';

const DeleteContent = ({
  onSuccess,
  onSubmit,
  onCancel,
}: {
  onSuccess?: () => void;
  onSubmit?: () => Promise<void>;
  onCancel: () => void;
}) => {
  const t = useTranslations('user-delete-account');
  const submitWord = t('submit-word');

  const schema = z.object({
    name: z.string().refine((v) => v.trim().toLowerCase() === submitWord.trim().toLowerCase(), {
      message: t('validation-error'),
    }),
  });

  const form = useForm({ schema, mode: 'onChange' });

  const compoundOnSubmit = async () => {
    await onSubmit?.();
    onSuccess?.();
  };

  const canSave = form.formState.isValid && !form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(compoundOnSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="mb-4 w-full text-center">
                {t('confirmation-label', { submitWord })}
              </FormLabel>
              <FormControl>
                <Input placeholder={t('fields.name.placeholder', { submitWord })} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-center gap-3">
          <Button type="button" variant="secondary" onClick={onCancel}>
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            disabled={!canSave}
            variant="destructive"
            className="transition-all duration-300"
          >
            {t('submit')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export const UserDeleteForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const session = useSession();
  const t = useTranslations('user-delete-account');

  const handleDeactivate = async () => {
    const toast = await importToastAsync();
    try {
      setLoading(true);
      await UserRepository.deactivate({});
      toast.success(t('success-message'));
      await AuthService.logout();
      router.push(Routing.Home.main({ query: {} }));
      // setLoading(false);
    } catch (e: unknown) {
      captureException(e);
      toast.error(t('error-message'));
      setLoading(false);
    }
  };

  return (
    <Section className="mx-auto my-auto flex max-w-md flex-col py-6">
      <ReText size="xl" weight="semibold" className="mb-4 text-center">
        {t('title')}
      </ReText>

      <ReText className="text-muted-foreground mb-4 text-center">
        {t('description')}
        <Link
          shallow={false}
          prefetch={false}
          href={Routing.Home.main({ query: {} })}
          className={linkBaseVariants({ variant: 'default' })}
          target="_blank"
        >
          {t('app-name')}
        </Link>
        {t('description-continued')}
      </ReText>

      {session?.is_premium && (
        <ReText weight="bold" className="text-destructive mb-4 text-center">
          {t('premium-warning')}
        </ReText>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            disabled={loading}
            loading={loading}
            variant="destructive"
            className="mx-auto mt-2 w-full max-w-xs"
          >
            {t('delete-button')}
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">{t('dialog-title')}</DialogTitle>
            <DialogDescription className="text-center">{t('dialog-warning')}</DialogDescription>
          </DialogHeader>

          <DeleteContent
            onSuccess={() => setIsOpen(false)}
            onSubmit={handleDeactivate}
            onCancel={() => setIsOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Section>
  );
};
