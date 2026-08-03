import { ComponentPropsWithoutRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';

import { closestCorners } from '@dnd-kit/core';

import { CloseIcon } from '@re/ui-kit/icons/close';
import { CopyIcon } from '@re/ui-kit/icons/copy';
import { DotsDoubleHorizontalIcon } from '@re/ui-kit/icons/dots-double-horizontal';
import { DotsDoubleVerticalIcon } from '@re/ui-kit/icons/dots-double-vertical';
import { TrashIcon } from '@re/ui-kit/icons/trash';
import { Button, ButtonProps } from '@re/ui-kit/ui/button';
import { Checkbox } from '@re/ui-kit/ui/checkbox';
import { RadioGroup, RadioGroupInputItem } from '@re/ui-kit/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@re/ui-kit/ui/select';
import { Switch } from '@re/ui-kit/ui/switch';

import {
  QUIZ_QUESTION_TYPE,
  QUIZ_QUESTION_TYPE_OPTIONS,
  QuizQuestionType,
} from '~shared/api/models/quiz';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '~shared/ui/form';
import { Input } from '~shared/ui/input';
import { Sortable, SortableDragHandle, SortableItem } from '~shared/ui/sortable/sortable';
import { cn } from '~shared/utils/cn';
import { useStrictContext } from '~shared/utils/use-strict-context';

import { QUIZ_FORM_CONFIG } from '../model/const';
import { QuizFormSchema } from '../model/schema';
import {
  QuizContext,
  QuizQuestionContext,
  QuizQuestionOptionContext,
  QuizQuestionOptionProvider,
  QuizQuestionProvider,
} from '../model/store';

const QuizFormQuestionTitleField = ({ className }: { className?: string }) => {
  const { control } = useFormContext<QuizFormSchema>();
  const { index } = useStrictContext(QuizQuestionContext);

  return (
    <FormField
      control={control}
      name={`questions.${index}.question`}
      render={({ field }) => (
        <FormItem className={className}>
          <FormControl>
            <Input {...field} type="text" placeholder="*Вопрос" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const QuizFormQuestionDescriptionField = ({ className }: { className?: string }) => {
  const { control } = useFormContext<QuizFormSchema>();
  const { index } = useStrictContext(QuizQuestionContext);

  return (
    <FormField
      control={control}
      name={`questions.${index}.description`}
      render={({ field }) => (
        <FormItem className={className}>
          <FormControl>
            <Input {...field} type="text" placeholder="Описание" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const QuizFormQuestionTypeField = ({ className }: { className?: string }) => {
  const { control } = useFormContext<QuizFormSchema>();
  const {
    index,
    actions: { changeType },
  } = useStrictContext(QuizQuestionContext);

  const value = useWatch({ control, name: `questions.${index}.type` });

  const tQuiz = useTranslations('quiz');

  return (
    <Select
      onValueChange={(value) => {
        changeType(Number(value));
      }}
      value={String(value)}
    >
      <SelectTrigger className={className}>
        <SelectValue defaultValue={1} placeholder="Выбрать" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {QUIZ_QUESTION_TYPE_OPTIONS.map(({ id, tName }) => (
            <SelectItem key={id} value={String(id)}>
              {tQuiz('type', { type: tName })}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

const QuizFormQuestionOptionMultiControl = ({ className }: { className?: string }) => {
  const { control } = useFormContext<QuizFormSchema>();
  const { index: questionIndex } = useStrictContext(QuizQuestionContext);
  const { index: optionIndex } = useStrictContext(QuizQuestionOptionContext);

  return (
    <FormField
      control={control}
      name={`questions.${questionIndex}.options.${optionIndex}.is_correct`}
      render={({ field }) => (
        <FormItem className={cn('grow-0', className)}>
          <FormControl>
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

const QuizFormQuestionOptionSingleControl = ({ className }: { className?: string }) => {
  const { control } = useFormContext<QuizFormSchema>();
  const { index: questionIndex } = useStrictContext(QuizQuestionContext);
  const {
    index: optionIndex,
    actions: { changeChecked },
  } = useStrictContext(QuizQuestionOptionContext);

  const value = useWatch({
    control,
    name: `questions.${questionIndex}.options.${optionIndex}.is_correct`,
  });

  const handleChange = () => changeChecked(QuizQuestionType.SINGLE);

  return (
    <RadioGroup value={String(value)} onValueChange={handleChange} className={className}>
      <RadioGroupInputItem value="true" />
    </RadioGroup>
  );
};

interface QuizFormQuestionOptionRemoveButton extends Omit<ButtonProps, 'onClick'> {}

const QuizFormQuestionOptionRemoveButton = (props: QuizFormQuestionOptionRemoveButton) => {
  const {
    actions: { removeOption },
  } = useStrictContext(QuizQuestionOptionContext);

  const { question } = useStrictContext(QuizQuestionContext);

  const disabled = (question.options?.length || 0) <= 1;

  return <Button onClick={removeOption} disabled={disabled} {...props} />;
};

export const QuizFormQuestionOption = ({ className }: { className?: string }) => {
  const { control } = useFormContext<QuizFormSchema>();
  const { index: questionIndex, question, hasCorrect } = useStrictContext(QuizQuestionContext);
  const { index: optionIndex } = useStrictContext(QuizQuestionOptionContext);

  const Control =
    question.type === QUIZ_QUESTION_TYPE.SINGLE
      ? QuizFormQuestionOptionSingleControl
      : QuizFormQuestionOptionMultiControl;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <SortableDragHandle asChild>
        <div className="grow-0">
          <DotsDoubleVerticalIcon />
        </div>
      </SortableDragHandle>
      {hasCorrect ? <Control /> : null}
      <FormField
        control={control}
        name={`questions.${questionIndex}.options.${optionIndex}.value`}
        render={({ field }) => (
          <FormItem className="w-full">
            <FormControl>
              <Input {...field} type="text" placeholder="*Ответ" />
            </FormControl>
          </FormItem>
        )}
      />
      <QuizFormQuestionOptionRemoveButton circle variant="ghost" className="grow-0">
        <CloseIcon />
      </QuizFormQuestionOptionRemoveButton>
    </div>
  );
};

export interface QuizFormQuestionOptionsProps extends ComponentPropsWithoutRef<'div'> {}

export const QuizFormQuestionOptions = (props: QuizFormQuestionOptionsProps) => {
  const { className, ...rest } = props;

  const tReusable = useTranslations('reusable');

  const { setValue } = useFormContext<QuizFormSchema>();

  const {
    index: questionIndex,
    question,
    actions: { addOption },
  } = useStrictContext(QuizQuestionContext);

  return (
    <div className={className} {...rest}>
      <div className="flex flex-col gap-2">
        <Sortable
          orientation="vertical"
          collisionDetection={closestCorners}
          value={question.options || []}
          enableSensorClick={false}
          onValueChange={(value) => {
            setValue(`questions.${questionIndex}.options`, value);
          }}
        >
          {question.options?.map((option, index) => (
            <SortableItem
              key={`${option.id}-${index}`} // important!
              value={option.id}
              className="w-full"
            >
              <QuizQuestionOptionProvider index={index}>
                <QuizFormQuestionOption />
              </QuizQuestionOptionProvider>
            </SortableItem>
          ))}
        </Sortable>
      </div>
      <Button size="sm" variant="flat" className="mt-4 ml-5" onClick={addOption}>
        {tReusable('actions.add')}
      </Button>
    </div>
  );
};

interface QuizFormQuestionFieldRemoveButtonProps extends Omit<ButtonProps, 'onClick'> {}

const QuizFormQuestionFieldRemoveButton = (props: QuizFormQuestionFieldRemoveButtonProps) => {
  const {
    actions: { removeQuestion },
  } = useStrictContext(QuizQuestionContext);
  const { control } = useFormContext<QuizFormSchema>();

  const questions = useWatch({ control, name: 'questions' });

  const disabled = questions.length <= QUIZ_FORM_CONFIG.questions.min;

  return <Button disabled={disabled} onClick={removeQuestion} {...props} />;
};

interface QuizFormQuestionFieldCopyButtonProps extends Omit<ButtonProps, 'onClick'> {}

const QuizFormQuestionFieldCopyButton = (props: QuizFormQuestionFieldCopyButtonProps) => {
  const {
    actions: { copyQuestion },
  } = useStrictContext(QuizQuestionContext);
  const { control } = useFormContext<QuizFormSchema>();

  const questions = useWatch({ control, name: 'questions' });

  const disabled = questions.length >= QUIZ_FORM_CONFIG.questions.max;

  return <Button disabled={disabled} onClick={copyQuestion} {...props} />;
};

export const QuizFormQuestion = () => {
  const {
    question,
    hasCorrect,
    actions: { setHasCorrect },
  } = useStrictContext(QuizQuestionContext);

  return (
    <div className="bg-secondary flex flex-col rounded-md p-4">
      <SortableDragHandle asChild>
        <div className="flex h-10 justify-center">
          <DotsDoubleHorizontalIcon />
        </div>
      </SortableDragHandle>
      <div className="flex gap-2">
        <QuizFormQuestionTitleField className="basis-full" />
        <QuizFormQuestionTypeField className="basis-1/4" />
      </div>
      <QuizFormQuestionDescriptionField className="mt-6" />
      {question.type === QuizQuestionType.SINGLE || question.type === QuizQuestionType.MULTI ? (
        <QuizFormQuestionOptions className="mt-6" />
      ) : null}
      <div className="mt-6 flex items-center gap-2">
        {question.type === QuizQuestionType.SINGLE || question.type === QuizQuestionType.MULTI ? (
          <div className="flex items-center gap-4">
            <Switch checked={hasCorrect} onCheckedChange={setHasCorrect} />
            <FormLabel className="!mb-0">правильный ответ</FormLabel>
          </div>
        ) : null}
        <div className="mt-2 ml-auto flex gap-2">
          <QuizFormQuestionFieldCopyButton circle variant="ghost">
            <CopyIcon />
          </QuizFormQuestionFieldCopyButton>
          <QuizFormQuestionFieldRemoveButton circle variant="ghost">
            <TrashIcon />
          </QuizFormQuestionFieldRemoveButton>
        </div>
      </div>
    </div>
  );
};

export const QuizFormQuestionList = () => {
  const { control, setValue } = useFormContext<QuizFormSchema>();

  const values = useWatch({ name: 'questions', control });

  return (
    <Sortable
      orientation="vertical"
      collisionDetection={closestCorners}
      value={values}
      enableSensorClick={false}
      onValueChange={(value) => {
        setValue('questions', value);
      }}
    >
      {values.map((it, index) => (
        <SortableItem
          key={`${it.id}-${index}`} // important!
          value={it.id}
          className="w-full"
        >
          <QuizQuestionProvider index={index}>
            <QuizFormQuestion />
          </QuizQuestionProvider>
        </SortableItem>
      ))}
    </Sortable>
  );
};

export interface QuizFormQuestionListAddButton extends Omit<ButtonProps, 'onClick'> {}

export const QuizFormQuestionListAddButton = (props: QuizFormQuestionListAddButton) => {
  const {
    actions: { addQuestion },
  } = useStrictContext(QuizContext);

  return <Button onClick={addQuestion} {...props} />;
};
