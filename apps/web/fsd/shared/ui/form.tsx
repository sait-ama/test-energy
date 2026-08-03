'use client';
//todo use fuck
import * as React from 'react';
import { PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';
import type {
  ControllerProps,
  FieldError,
  FieldPath,
  FieldPathValue,
  FieldValues,
  UseFormProps,
} from 'react-hook-form';
import {
  Controller,
  FormProvider,
  useForm as __useForm,
  useFormContext,
  UseFormReturn,
  useFormState,
  useWatch,
} from 'react-hook-form';
// @ts-ignore
import type { FormProviderProps } from 'react-hook-form/dist/types';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodSchema } from 'zod';

import { createContextSelector } from '@re/core/utils/create-context-selector';
import type * as LabelPrimitive from '@re/ui-kit/ui/label';
import { Label } from '@re/ui-kit/ui/label';
import { Slot } from '@re/ui-kit/ui/slot';
import { cn } from '@re/ui-kit/utils/cn';

import { createTransformedResolver } from '~shared/lib/form/error-handling-base';
import { useI18nZodErrors } from '~shared/lib/i18n/makeZodI18nMap';

('use no memo');

interface FormExtraArgsValues {
  disabled?: boolean;
  excludedFields?: string[];
}

interface FormExtraArgsSetters {
  setDisabled: (value: boolean) => void;
}

type FormExtraArgs = FormExtraArgsSetters & FormExtraArgsValues;

const { Provider: FormExtraArgsProvider, useStore: useFormExtraArgs } = createContextSelector<
  FormExtraArgs,
  FormExtraArgsValues
>((values) => {
  const [disabled, setDisabled] = useState(values.disabled);

  return { disabled, setDisabled, excludedFields: values.excludedFields ?? [] };
});

interface FormSchema<TFormValues extends FieldValues, TTransformedValues = TFormValues>
  extends Omit<UseFormProps<TFormValues>, 'resolver'> {
  extraArgs?: FormExtraArgsValues;
  schema: ZodSchema<TTransformedValues>;
  transformer?: (values: TFormValues) => TTransformedValues;
}

interface UtilityFields<T> {
  __error?: T;
}

const useForm = <TFormValues extends FieldValues, TTransformedValues = TFormValues>(
  props: FormSchema<TFormValues, TTransformedValues>
) => {
  'use no memo';

  const { extraArgs, schema, transformer, ...rest } = props;
  const defaultResolver = zodResolver(schema);
  // @ts-expect-error
  const resolver = transformer
    ? (createTransformedResolver(schema, transformer) as typeof defaultResolver)
    : defaultResolver;
  useI18nZodErrors();

  const form = __useForm<TFormValues & UtilityFields<unknown>>({
    ...rest,
    resolver,
  });

  return { ...form, extraArgs };
};

interface FormProviderSchemaProps<
  TFieldValues extends FieldValues,
  TContext = unknown,
  TTransformedValues extends FieldValues | undefined = undefined,
> extends FormProviderProps<TFieldValues, TContext, TTransformedValues>,
    PropsWithChildren {
  extraArgs?: FormExtraArgsValues;
}

const Form = <
  TFieldValues extends FieldValues,
  TContext = unknown,
  TTransformedValues extends FieldValues | undefined = undefined,
>(
  props: FormProviderSchemaProps<TFieldValues, TContext, TTransformedValues>
) => {
  'use no memo';

  const { children, extraArgs = {}, ...form } = props;

  return (
    <FormExtraArgsProvider value={extraArgs}>
      <FormProvider {...form}>{children}</FormProvider>
    </FormExtraArgsProvider>
  );
};

interface FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
  id: string;
  formItemId: string;
  formDescriptionId: string;
  formMessageId: string;
  invalid: boolean;
  isDirty: boolean;
  isTouched: boolean;
  isValidating: boolean;
  disabled: boolean;
  error?: FieldError;
}

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: ControllerProps<TFieldValues, TName>
) => {
  'use no memo';

  const excludedFields = useFormExtraArgs((v) => v.excludedFields);

  if (excludedFields && excludedFields.includes(props.name)) return null;

  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  'use no memo';

  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();
  const disabled = useFormExtraArgs((v) => v.disabled);
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    disabled,
    ...fieldState,
  };
};

interface FormItemContextValue {
  id: string;
}

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

const FormItem = ({
  ref,
  className,
  id,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  ref?: React.RefObject<HTMLDivElement>;
}) => {
  'use no memo';

  const _id = React.useId();

  return (
    <FormItemContext.Provider value={{ id: id || _id }}>
      <div ref={ref} className={className} {...props} />
    </FormItemContext.Provider>
  );
};
FormItem.displayName = 'FormItem';

const FormLabel = ({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof LabelPrimitive.Label> & {
  ref?: React.RefObject<React.ComponentRef<typeof LabelPrimitive.Label>>;
}) => {
  'use no memo';

  const { error, formItemId } = useFormField();
  return (
    <Label
      ref={ref}
      className={cn('mb-3 inline-block font-medium', error && 'text-destructive', className)}
      htmlFor={formItemId}
      {...props}
    />
  );
};
FormLabel.displayName = 'FormLabel';

const FormControl = ({
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof Slot> & {
  ref?: React.RefObject<React.ComponentRef<typeof Slot>>;
}) => {
  'use no memo';

  const { error, formItemId, formDescriptionId, disabled, formMessageId } = useFormField();

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={!error ? formDescriptionId : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      // @ts-ignore
      disabled={disabled}
      {...props}
    />
  );
};
FormControl.displayName = 'FormControl';

const FormDescription = ({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement> & {
  ref?: React.RefObject<HTMLParagraphElement>;
}) => {
  'use no memo';

  const { formDescriptionId } = useFormField();

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn('text-muted-foreground text-[0.8rem]', className)}
      {...props}
    />
  );
};
FormDescription.displayName = 'FormDescription';

const FormMessage = ({
  ref,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement> & {
  ref?: React.RefObject<HTMLParagraphElement>;
}) => {
  'use no memo';

  const { error, formMessageId } = useFormField();
  const body = error ? String(error.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn('text-destructive text-[0.8rem] font-medium', className)}
      {...props}
    >
      {body}
    </p>
  );
};
FormMessage.displayName = 'FormMessage';

export const FormSeparateMessage = ({
  ref,
  className,
  children,
  name,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement> & {
  ref?: React.RefObject<HTMLParagraphElement>;
  name: string;
}) => {
  'use no memo';

  const { getFieldState } = useFormContext();
  const formState = useFormState({ name });
  const fieldState = getFieldState(name, formState);
  const error = fieldState.error;
  const body = error ? String(error?.message || error?.root?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p ref={ref} className={cn('text-destructive text-[0.8rem] font-medium', className)} {...props}>
      {body}
    </p>
  );
};
FormMessage.displayName = 'FormSeparateMessage';

const FormConsumer = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  children,
  name,
  control,
}: {
  children: (arg: { value: FieldPathValue<TFieldValues, TName> }) => React.ReactNode;
  name: TName;
} & Pick<ControllerProps<TFieldValues, TName>, 'control'>) => {
  'use no memo';

  const value = useWatch({ name, control });

  return children({ value });
};
FormConsumer.displayName = 'FormConsumer';

export {
  Form,
  FormConsumer,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
  useFormField,
};

export interface UseDebouncedFormChangeProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onFormChange?: (data: T) => void;
  debounceTimeout?: number;
}
//
export const useDebouncedFormChange = <T extends FieldValues>({
  form,
  onFormChange,
  debounceTimeout = 500,
}: UseDebouncedFormChangeProps<T>) => {
  const { isDirty } = useFormState({
    control: form.control,
  });

  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  const debouncedOnChange = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (onFormChange && isDirty) {
        onFormChange(form.getValues());
      }
    }, debounceTimeout);
  }, [onFormChange, debounceTimeout, form, isDirty]);

  useEffect(() => {
    if (onFormChange && isDirty) {
      const subscription = form.watch(debouncedOnChange);
      return () => subscription.unsubscribe();
    }
    return () => {};
  }, [isDirty, onFormChange, form, debouncedOnChange]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);
};
export { useFieldArray } from 'react-hook-form';
