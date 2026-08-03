import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

export const PublisherConnectedCard = ({
  card,
  id,
  onRemove,
}: {
  card: string;
  id: number;
  onRemove: (id: number) => Promise<void>;
}) => {
  const handleRemove = () => onRemove(id);

  return (
    <div className="flex items-center">
      <ReText className="mr-4">{card}</ReText>
      <Button size="sm" onClick={handleRemove}>
        Удалить
      </Button>
      <style jsx>{`
        div {
          padding: 8px;
          margin-bottom: 4px;
          border-bottom: var(--border);
        }
      `}</style>
    </div>
  );
};
