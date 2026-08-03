import type { ReactNode } from 'react';
import Link from 'next/link';

import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import { getCharacterKey } from '~entities/character/model/queries';
import { HorizontalCharacterCard } from '~entities/character/ui/horizontal-character-card';
import { UnknownHorizontalCharacterCardFallback } from '~entities/character/ui/unknown-horizontal-character-card-fallback';
import { useCardForms } from '~entities/inventory/model/queries';
import { HeroCardImage } from '~entities/inventory/ui/hero-card-image';
import { useCancelRequest } from '~entities/user/model/mutations';
import type { CharacterSchemaFragment } from '~shared/api/models/character';
import {
  ChangeRequestSchema,
  ChangeRequestStatus,
  ChangeRequestType,
  UserRequestResponseSchema,
} from '~shared/api/models/panel';
import { Routing } from '~shared/config/routing';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { ContentSuspenseQuery } from '~shared/lib/react-query/content-suspense-query';
import { QuerySuspenseContainer } from '~shared/lib/react-query/query-suspense-container';
import { useConfirmedAsyncAction } from '~shared/lib/submit-action/use-submit-action';
import { Input } from '~shared/ui/input';
import { RichText } from '~shared/ui/rich-text';

interface FieldsProps {
  model: ChangeRequestSchema;
}

const CardFields = (props: FieldsProps) => {
  const { model } = props;
  const { data: filters } = useCardForms();
  const rank = filters?.content?.ranks?.find((v) => v.id === model.fields.rank);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-5 sm:flex-row">
        <HeroCardImage
          alt="card img"
          src={model.fields.cover}
          className="max-w-[150px] self-center"
        />
        <div className="flex flex-[1] flex-col gap-3">
          {rank ? (
            <div className="flex flex-col gap-2">
              <ReText>Ранг</ReText>
              <Input disabled value={rank.name} />
            </div>
          ) : null}
          <div className="flex flex-col gap-2">
            <ReText>Персонаж</ReText>
            <QuerySuspenseContainer
              fallback={null}
              fallbackRender={(_) => {
                return (
                  <UnknownHorizontalCharacterCardFallback
                    className="border-red-500/40"
                    header="Неизвестный"
                    description="Возможно, был удален"
                  />
                );
              }}
            >
              <ContentSuspenseQuery
                queryOptions={{
                  ...getCharacterKey({
                    variables: {
                      params: {
                        characterId: model.fields.character,
                      },
                    },
                  }),
                  enabled: !!model.fields.character,
                }}
              >
                {({ data }: { data: CharacterSchemaFragment }) =>
                  data ? <HorizontalCharacterCard model={data} /> : null
                }
              </ContentSuspenseQuery>
            </QuerySuspenseContainer>
          </div>
        </div>
      </div>
      {model.fields.description ? (
        <div className="flex flex-col gap-2">
          <ReText>Описание</ReText>
          <RichText className="border-border rounded-md border p-3">
            {model.fields.description}
          </RichText>
        </div>
      ) : null}
      {model.moderator_message ? (
        <div className="flex flex-col gap-2">
          <ReText>Сообщение от модератора</ReText>
          <RichText className="border-border rounded-md border p-3">
            {model.moderator_message}
          </RichText>
        </div>
      ) : null}
    </div>
  );
};

const ExtraCardAction = <T extends ChangeRequestType>({
  data,
}: {
  data: UserRequestResponseSchema<T>;
}) => {
  const { mutateAsync } = useCancelRequest();

  const handleDeny = async () => {
    try {
      await mutateAsync({ requestId: data.id });
    } catch (e: unknown) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  const handleDenyWithConfirmation = useConfirmedAsyncAction(handleDeny, {
    title: 'Отменить заявку?',
    description: 'Вы уверены, что хотите отменить заявку?',
    confirmVariant: 'destructive',
    closeVariant: 'secondary',
  });

  return (
    <div className="flex justify-end gap-2">
      {data.status == ChangeRequestStatus.OPEN ? (
        <Button size="sm" color="secondary" onClick={handleDenyWithConfirmation}>
          Отменить заявку
        </Button>
      ) : null}

      <Button size="sm" color="secondary">
        <Link
          href={Routing.Card.add({
            query: {
              defaultValues: JSON.stringify({
                rank: data.fields.rank,
                description: data.fields.description,
                character: data.fields.character,
              }),
            },
          })}
        >
          Использовать как шаблон
        </Link>
      </Button>
    </div>
  );
};

export const renderRequestItem = (options: { data: UserRequestResponseSchema }): ReactNode => {
  const { data } = options;

  switch (data.type) {
    case ChangeRequestType.CARD_ITEM_ADD:
      return (
        <div className="flex flex-col gap-5">
          <CardFields model={data} />
          <ExtraCardAction data={data} />
        </div>
      );
    default:
      return null;
  }
};
