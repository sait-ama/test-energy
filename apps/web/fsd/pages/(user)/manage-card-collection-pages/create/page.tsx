'use client';
import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import Edit from '@re/ui-kit/icons/edit';
import { Button } from '@re/ui-kit/ui/button';
import { ScrollArea } from '@re/ui-kit/ui/scroll-area';
import { ScrollBar } from '@re/ui-kit/ui/shadow-scroll-area';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import {
  MAX_CARDS_4_COLLECTION,
  MIN_CARDS_4_COLLECTION,
} from '~features/(manage-card-collections)/manage-forms/model/consts';
import { MangeCollectionCardsClientSchema } from '~features/(manage-card-collections)/manage-forms/model/schema';
import {
  Renderer,
  SelectableCardsField,
} from '~features/(manage-card-collections)/manage-forms/ui/fields/cards/form-item';
import {
  CardList,
  ExternalListContainer,
  ListSuspense,
} from '~features/(manage-card-collections)/manage-forms/ui/fields/cards/list-all';
import { NameFieldEditTrigger } from '~features/(manage-card-collections)/manage-forms/ui/fields/name';
import { CardCollectionHorizontalCards } from '~pages/(user)/manage-card-collection-pages/common/ui/card-collection-els';
import {
  BottomActions as CollectionCardsBottomActions,
  manageCardCollectionTriggerId,
} from '~pages/(user)/manage-card-collection-pages/create/bottom-actions';
import { useIsomorphicEffect } from '~shared/hooks/use-isomorphic-effect';
import {
  BottomActionsBase,
  BottomActionsRootProvider,
  useBottomActions,
} from '~shared/lib/bottom-bar/use-bottom-actions';
import { QuerySuspenseContainer } from '~shared/lib/react-query/query-suspense-container';
import { Container } from '~shared/ui/container';
import { Form, FormField, FormItem, useForm } from '~shared/ui/form';

const WithBottomActions = () => {
  const { register, unregister } = useBottomActions();

  useIsomorphicEffect(() => {
    register({
      index: 0,
      key: manageCardCollectionTriggerId,
      node: <CollectionCardsBottomActions />,
    });
    return () => unregister(manageCardCollectionTriggerId);
  }, []);
  return <></>;
};
export const CreateCardCollectionFormPage = () => {
  const searchParams = useSearchParams();
  // @ts-ignore
  const form = useForm({
    schema: MangeCollectionCardsClientSchema,
    defaultValues: {
      name: searchParams.get('name') || '',
      cards: [],
    },
  });
  useEffect(() => {
    const subscription = form.watch(() => {});
    return () => subscription.unsubscribe();
  }, [form]);

  const render: Renderer = useCallback(({ selectedCards, handleCardSelect }) => {
    return (
      <>
        <div className="flex items-center justify-between gap-4">
          <FormField
            render={({ field }) => (
              <FormItem className="flex items-center gap-4">
                <ReText size="md">{field.value}</ReText>
                <NameFieldEditTrigger
                  defaultValue={field.value}
                  onSuccess={(name) => field.onChange(name, { dirty: true })}
                  asChild
                >
                  <Button variant="ghost" circle>
                    <Edit />
                  </Button>
                </NameFieldEditTrigger>
              </FormItem>
            )}
            name="name"
          />
          <span className="flex items-center font-bold">
            <ReText
              className={cn({
                'font-semibold text-red-400/80': selectedCards.length < MIN_CARDS_4_COLLECTION,
                'text-primary font-semibold': selectedCards.length >= MIN_CARDS_4_COLLECTION,
              })}
            >
              {selectedCards.length}
            </ReText>
            <ReText className="font-semibold">/{MAX_CARDS_4_COLLECTION}</ReText>
          </span>
        </div>
        <div className="bg-background/90 sticky top-[0px] left-0 z-100 py-2 sm:top-auto md:top-[56px]">
          <CardCollectionHorizontalCards maxCards={20} items={selectedCards.map((v) => v.card)} />
        </div>
        <QuerySuspenseContainer
          fallback={
            <ExternalListContainer>
              <ListSuspense />
            </ExternalListContainer>
          }
        >
          <ScrollArea viewportClassName="px-1">
            <CardList
              selectedCards={selectedCards}
              onCardSelect={handleCardSelect}
              maxCards={MAX_CARDS_4_COLLECTION}
            />
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </QuerySuspenseContainer>
      </>
    );
  }, []);
  return (
    <Container layout="extraslim" className="my-8">
      <Form {...form}>
        {/*// @ts-ignore*/}
        <form className="relative">
          <SelectableCardsField>{render}</SelectableCardsField>
          <BottomActionsRootProvider>
            <BottomActionsBase />
            <WithBottomActions />
          </BottomActionsRootProvider>
        </form>
      </Form>
    </Container>
  );
};
