import { LoadingIndicator } from '../../ui/loading-indicator';

export const LoadingChannels = () => {
  // Количество плейсхолдеров, которые нужно отобразить
  const placeholdersCount = 6;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2">
      <LoadingIndicator className="size-6" />
      {/* {Array.from({ length: placeholdersCount }).map((_, index) => (
                <ChannelPreviewPlaceholder key={index} />
            ))} */}
    </div>
  );
};
