'use client';
import { useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';

import Edit from '@re/ui-kit/icons/edit';
import { Button } from '@re/ui-kit/ui/button';
import { ScrollArea } from '@re/ui-kit/ui/scroll-area';
import { ScrollBar } from '@re/ui-kit/ui/shadow-scroll-area';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';
import { useQuery } from '@tanstack/react-query';

import { getCardRetrieveQueryKey } from '~entities/card-collections/model/queries';
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
import { BottomActionsRenderer } from '~pages/(user)/manage-card-collection-pages/common/ui/bottom-actions-renderer';
import { CardCollectionHorizontalCards } from '~pages/(user)/manage-card-collection-pages/common/ui/card-collection-els';
import {
  BottomActions,
  editCardCollectionTriggerId,
} from '~pages/(user)/manage-card-collection-pages/edit/bottom-actions';
import { useIsomorphicEffect } from '~shared/hooks/use-isomorphic-effect';
import {
  BottomActionsRootProvider,
  useBottomActions,
} from '~shared/lib/bottom-bar/use-bottom-actions';
import { QuerySuspenseContainer } from '~shared/lib/react-query/query-suspense-container';
import { useSession } from '~shared/lib/session/use-session';
import { Container } from '~shared/ui/container';
import { Form, FormField, FormItem, useForm } from '~shared/ui/form';

const WithBottomActions = () => {
  const { register, unregister } = useBottomActions();

  useIsomorphicEffect(() => {
    register({
      index: 0,
      key: editCardCollectionTriggerId,
      node: <BottomActions />,
    });
    return () => unregister(editCardCollectionTriggerId);
  }, []);

  return null;
};
export const EditCardCollectionFormPage = () => {
  const user_id = useSession((v) => v?.id)!;
  const params = useParams<{ collection_id: string }>();
  const collection_id = Number(params.collection_id);
  const query = useMemo(
    () =>
      getCardRetrieveQueryKey({
        variables: { params: { collection_id, user_id } },
      }),
    [user_id, collection_id]
  );
  const { data: collection } = useQuery(query);
  const defaultValues = useMemo(
    () => ({
      cards: [],
      name: '',
      ...collection,
      position: collection?.position ?? 1,
    }),
    [collection]
  );
  const form = useForm({
    schema: MangeCollectionCardsClientSchema,
    mode: 'onChange',
    defaultValues,
  });
  useEffect(() => {
    if (collection) {
      form.reset(collection);
    }
  }, [collection]);
  useEffect(() => {
    const subscription = form.watch(() => {});
    return () => subscription.unsubscribe();
  }, [form, collection]);
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
          <CardCollectionHorizontalCards
            maxCards={20}
            visibleSlots={MIN_CARDS_4_COLLECTION}
            items={(selectedCards ?? []).map((v) => v.card)}
          />
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
              selectedCards={selectedCards || []}
              onCardSelect={handleCardSelect}
              maxCards={20}
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
        <form className="relative">
          <SelectableCardsField>{render}</SelectableCardsField>
          <BottomActionsRootProvider>
            <BottomActionsRenderer />
            <WithBottomActions />
          </BottomActionsRootProvider>
        </form>
      </Form>
    </Container>
  );
};
