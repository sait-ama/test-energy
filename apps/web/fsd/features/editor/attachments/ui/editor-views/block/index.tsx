import { POST_ATTACHMENT_TYPE } from '~entities/post-attachment/model/const';

import { PublisherBlockView } from './publisher';
import { QuizBlockView } from './quiz';
import { TitleBlockView } from './title';
import { UserBlockView } from './user';

const pickNodeModel = (opts: { entity: string; entityId: string; models: Record<string, any> }) => {
  let model = null;

  if (opts.entity === POST_ATTACHMENT_TYPE.quiz) {
    model =
      opts.models[POST_ATTACHMENT_TYPE.quiz]?.find((it) => it.quizz.id == opts.entityId) ?? null;
  } else {
    model = opts.models[`${opts.entity}`]?.find((it) => it.id == opts.entityId);
  }

  return model;
};

export type BlockEditorViewProps = {
  entityId: string;
  entity: string;
  remove: () => void;
  models: Record<string, any>;
  model: any;
};

export const BlockEditorView = (props: BlockEditorViewProps) => {
  const model =
    props.model ??
    pickNodeModel({ entity: props.entity, entityId: props.entityId, models: props.models }) ??
    null;

  if (!model) return null;

  if (props.entity === POST_ATTACHMENT_TYPE.quiz) {
    return <QuizBlockView model={model} onRemove={props.remove} />;
  }

  if (props.entity === POST_ATTACHMENT_TYPE.user) {
    return <UserBlockView model={model} onRemove={props.remove} />;
  }

  if (props.entity === POST_ATTACHMENT_TYPE.title) {
    return <TitleBlockView model={model} onRemove={props.remove} />;
  }

  if (props.entity === POST_ATTACHMENT_TYPE.publisher) {
    return <PublisherBlockView model={model} onRemove={props.remove} />;
  }

  return null;
};
