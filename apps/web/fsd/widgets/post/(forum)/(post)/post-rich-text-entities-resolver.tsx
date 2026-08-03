import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { ClubDetail, PublisherDetail, TitleDetail, UserDetail } from '@re/api/generated/types.gen';
import ExternalLinkIcon from '@re/ui-kit/icons/external-link';
import { Button } from '@re/ui-kit/ui/button';

import { POST_ATTACHMENT_TYPE } from '~entities/post-attachment/model/const';
import { HorizontalTitleCard } from '~entities/title/ui/horizontal-title-card';
import { UserSnapshotPreviewModalTrigger } from '~entities/user/ui/user-snapshot-preview/user-snapshot-preview-trigger';
import { MENTION_VARIANTS } from '~features/editor/attachments/model/const';
import { UserSchema } from '~shared/api/models/user';
import { Routing } from '~shared/config/routing';
import { HorizontalCard } from '~shared/ui/horizontal-card';
import { LinkBase } from '~shared/ui/link-base';
import { parseEntityBlock } from '~shared/ui/text-editor/nodes/entity-block-node';
import { parseEntityMention } from '~shared/ui/text-editor/nodes/entity-mention-node';
import { Quiz as QuizWidget } from '~widgets/quiz/ui/quiz';

const getSnapshotProps = (entity: string, _model: unknown) => {
  if (!_model) return null;

  if (entity === POST_ATTACHMENT_TYPE.user) {
    const model = _model as UserDetail;

    return {
      username: model.username,
      cover: model.cover,
      avatar: model.avatar,
      frame: model.frame,
    };
  }

  if (entity === POST_ATTACHMENT_TYPE.publisher) {
    const model = _model as PublisherDetail;

    return {
      cover: model.cover,
      avatar: model.img,
      username: model.name,
    };
  }

  if (entity === POST_ATTACHMENT_TYPE.club) {
    const model = _model as ClubDetail;

    return {
      cover: model.cover,
      avatar: model.avatar,
      username: model.name,
    };
  }

  return null;
};

const getLink = (entity: string, _model: unknown) => {
  if (!_model) return '#';

  if (entity === POST_ATTACHMENT_TYPE.user) {
    const model = _model as UserDetail;
    return Routing.User.detail({ params: { id: model.id } });
  }

  if (entity === POST_ATTACHMENT_TYPE.publisher) {
    const model = _model as PublisherDetail;

    return Routing.Publisher.detail({ params: { dir: model.dir } });
  }

  if (entity === POST_ATTACHMENT_TYPE.club) {
    const model = _model as ClubDetail;

    return Routing.Club.clubByDir({ params: { dir: model.dir, tab: 'about' } });
  }

  return '#';
};

interface PostMentionProps<T> {
  entity: string;
  id: string | number;
  model: T;
}

const PostMention = ({ entity, id, model }: PostMentionProps) => {
  const tReusable = useTranslations('reusable');
  const snapshotProps = getSnapshotProps(entity, model);
  const link = getLink(entity, model);

  const variant = MENTION_VARIANTS.find((it) => it.type === entity);

  const content = `@${entity}_${id}`;

  if (!snapshotProps || !variant)
    return (
      <LinkBase>
        <Link href={link}>{content}</Link>
      </LinkBase>
    );

  return (
    <UserSnapshotPreviewModalTrigger
      footer={
        <div className="flex items-center justify-between gap-2">
          <Button color="secondary" size="sm">
            {tReusable(`entities.attachments.${variant.tName}`)}
          </Button>
          <Button size="sm" endIcon={<ExternalLinkIcon />}>
            <Link href={link}>{tReusable('actions.visit')}</Link>
          </Button>
        </div>
      }
      model={snapshotProps}
      asChild
    >
      <LinkBase>
        <span>{snapshotProps.username ? `@${snapshotProps.username}` : content}</span>
      </LinkBase>
    </UserSnapshotPreviewModalTrigger>
  );
};
//todo
interface PostRichTextEntitesResolverProps {
  schema: Record<string, string>;
  attachments: Record<string, unknown>;
}

export const PostRichTextEntitesResolver = ({
  schema,
  attachments,
}: PostRichTextEntitesResolverProps) => {
  const t = useTranslations('reusable.entities.attachments');
  const parsedEntityMention = parseEntityMention(schema);

  if (parsedEntityMention) {
    const entities = attachments[parsedEntityMention.entity];
    const model = entities?.find((it) => it.id == parsedEntityMention.id);

    return (
      <PostMention entity={parsedEntityMention.entity} id={parsedEntityMention.id} model={model} />
    );
  }

  const parsedEntityBlock = parseEntityBlock(schema);

  if (parsedEntityBlock) {
    const entities = attachments[parsedEntityBlock.entity];

    if (parsedEntityBlock.entity === POST_ATTACHMENT_TYPE.quiz) {
      const model = entities?.find((it) => it.quiz.id == parsedEntityBlock.id);

      if (model)
        return (
          <div className="border-border bg-secondary my-4 rounded-md border p-4">
            <QuizWidget model={model} config={{ size: 'md' }} />
          </div>
        );
    }

    if (parsedEntityBlock.entity === POST_ATTACHMENT_TYPE.user) {
      const _model = entities?.find((it) => it.id == parsedEntityBlock.id);

      if (_model) {
        const model = _model as UserSchema;

        return (
          <Link href={Routing.User.detail({ params: { id: model.id } })}>
            <HorizontalCard
              className="bg-secondary my-3 p-2"
              imageHeight={80}
              imageWidth={80}
              name={model.username}
              image={model.avatar?.high}
              actions={
                <div className="flex items-center gap-2">
                  <Button color="muted">{t('user')}</Button>
                </div>
              }
            />
          </Link>
        );
      }
    }

    if (parsedEntityBlock.entity === POST_ATTACHMENT_TYPE.publisher) {
      const _model = entities?.find((it) => it.id == parsedEntityBlock.id);

      if (_model) {
        const model = _model as PublisherDetail;

        return (
          <Link href={Routing.Publisher.detail({ params: { dir: model.dir } })}>
            <HorizontalCard
              className="bg-secondary my-3 p-2"
              imageHeight={80}
              imageWidth={80}
              name={model.name}
              image={model.cover?.high}
              subtitle={model.tagline}
              actions={
                <div className="flex items-center gap-2">
                  <Button color="muted">{t('publisher')}</Button>
                </div>
              }
            />
          </Link>
        );
      }
    }

    if (parsedEntityBlock.entity === POST_ATTACHMENT_TYPE.title) {
      const _model = entities?.find((it) => it.id == parsedEntityBlock.id);

      if (_model) {
        const model = _model as TitleDetail;

        return (
          <HorizontalTitleCard className="bg-secondary border-border my-3 border" model={model} />
        );
      }
    }
  }

  return null;
};
