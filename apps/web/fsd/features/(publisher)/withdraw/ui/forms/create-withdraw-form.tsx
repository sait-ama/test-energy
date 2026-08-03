import type { SubmitHandler } from 'react-hook-form';

import type { z } from 'zod';

import { Badge } from '@re/ui-kit/ui/badge';
import { Button } from '@re/ui-kit/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@re/ui-kit/ui/select';
import { SkeletonSlot } from '@re/ui-kit/ui/skeleton';

import { useCurrentPublisher } from '~entities/publisher/model/hooks';
import { useConnectedCards } from '~features/(publisher)/withdraw/model/hooks';
import { useCreateWithDrawMutation } from '~features/(publisher)/withdraw/model/mutations';
import { CreateWithDrawValidatorMaker } from '~features/(publisher)/withdraw/model/validators';
import type { PublisherResponseSchema } from '~shared/api/models/publisher';
import { useErrorHandler } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
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
import { Section, SectionContent, SectionTitle } from '~shared/ui/section';
import { importToastAsync } from '~shared/ui/toast/toast.async';

export const CreateWithDrawPublisherFormRoot = () => {
  const { data: publisher, isLoading } = useCurrentPublisher((v) => v);
  useConnectedCards();

  return (
    <SkeletonSlot show={isLoading} render={<CreateWithdrawForm publisherData={publisher!} />} />
  );
};

const withdrawQuickMapper = [
  { label: '500', value: 500 },
  { label: '1000', value: 1000 },
  { label: '2000', value: 2000 },
  { label: '5000', value: 5000 },
  { label: '10000', value: 10000 },
  { label: '20000', value: 20000 },
];

const CreateWithdrawForm = ({ publisherData }: { publisherData: PublisherResponseSchema }) => {
  const { data: publisher = publisherData } = useCurrentPublisher((v) => v);
  const { props: { MAX_WITHDRAW_SUM: maxSum, MIN_WITHDRAW_SUM: minSum } = {} } = publisher;
  const { cards: allCards } = useConnectedCards();
  // @ts-ignore
  const schema = CreateWithDrawValidatorMaker({ maxSum, minSum });
  const { mutateAsync, isPending } = useCreateWithDrawMutation(publisher.content.id);
  const form = useForm({ schema, shouldUnregister: !publisher });
  const resolver = useErrorHandler({ form });

  const availableWithdrawOptions = withdrawQuickMapper.filter(
    ({ value }) => value >= minSum! && value <= maxSum!
  );

  const onSubmit: SubmitHandler<z.infer<typeof schema>> = async (data) => {
    try {
      const toast = await importToastAsync();
      await mutateAsync(data);
      toast.success('Заявка на вывод успешно создана');
    } catch (e) {
      logger.error(e);
      await resolver(e);
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, console.log)}>
        <Section>
          <SectionTitle>Вывод</SectionTitle>
          <SectionContent className='className="flex gap-4" w-full flex-col flex-wrap justify-between'>
            <FormField
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Выберите карту</FormLabel>
                  <FormControl>
                    <Select value={String(field.value)} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {allCards.map(({ id, card }) => (
                          <SelectItem key={id} value={String(id)}>
                            {card}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              name="purse"
            />
            <FormField
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Сумма вывода от {minSum} до {maxSum}
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              name="sum"
            />
            <div className="mt-2">
              {availableWithdrawOptions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {availableWithdrawOptions.map(({ label, value }) => (
                    <Badge
                      color="secondary"
                      key={value}
                      className="cursor-pointer"
                      onClick={() => form.setValue('sum', String(value))}
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
            <Button className="mt-4" loading={isPending} type="submit">
              Отправить
            </Button>
          </SectionContent>
        </Section>
      </form>
    </Form>
  );
};
