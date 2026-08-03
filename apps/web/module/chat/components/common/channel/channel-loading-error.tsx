import { Button } from '@re/ui-kit/ui/button';

export const ChannelErrorState = ({ refetch }: { refetch?: () => void }) => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="text-muted-foreground flex flex-col items-center gap-2 text-center">
        <p>Ошибка при загрузке чата</p>
        {refetch && (
          <Button
            variant="outline"
            onClick={() => {
              refetch?.();
            }}
          >
            Перезагрузить
          </Button>
        )}
      </div>
    </div>
  );
};
