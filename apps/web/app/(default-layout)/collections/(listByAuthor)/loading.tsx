// Глобальный лоудинг позволяет нам показывать плейсхолдер
// пока мы подгружаем дату
// это нужно для решения проблемы с долгой навигацией

import { CollectionCardSkeleton } from '~entities/collection/ui/collection-card';
import { FlatListLayout } from '~shared/ui/flat-list-v2';

const skeletons = new Array(20).fill(null);
export default function RootLoading() {
  return (
    <div>
      <FlatListLayout className="xs:grid-cols-2 grid w-full grid-cols-2 gap-4 max-sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {skeletons.map((_, index) => (
          <CollectionCardSkeleton key={index} />
        ))}
      </FlatListLayout>
    </div>
  );
}
