import { MENTION_VARIANTS } from '../../model/const';

export type MentionEditorViewProps = {
  entity: string;
  entityId: string;
  remove: () => void;
};

export const MentionEditorView = ({ entity, entityId }: MentionEditorViewProps) => {
  const variant = MENTION_VARIANTS.find((it) => it.type === entity);

  if (!variant) return null;

  return (
    <span className="text-primary mx-1 inline">
      @{variant?.type}_{entityId}
    </span>
  );
};
