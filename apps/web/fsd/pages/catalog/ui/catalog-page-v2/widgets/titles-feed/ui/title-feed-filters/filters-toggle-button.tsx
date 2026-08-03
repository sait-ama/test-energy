import Filters from '@re/ui-kit/icons/filters';
import { Badge } from '@re/ui-kit/ui/badge';
import { Button } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

import { useCountActiveFilters } from '~pages/catalog/ui/catalog-page-v2/features/title-filters/hooks/use-count-active-filters';

import { useTitleFiltersStore } from '../../../../features/title-filters/model/context';
import { useTitlesFiltersState } from '../../model/context';

const FILTERS_TO_IGNORE = ['ordering', 'types', 'exclude_types'];

export const FiltersToggleButton = (props: { className?: string }) => {
  const { className } = props;

  const { setFiltersOpen } = useTitlesFiltersState();
  const resetAllFilters = useTitleFiltersStore((v) => v.resetAllFilters);
  const countFilters = useCountActiveFilters(FILTERS_TO_IGNORE);

  return (
    <div className={cn('flex flex-row items-center gap-2', className)}>
      <Button
        variant="outline"
        // size="lg"
        className={cn('bg-input relative h-9 border-0 pr-5 pl-4 max-md:h-9')}
        onClick={() => {
          setFiltersOpen((prev) => !prev);
        }}
        startIcon={<Filters className="mr-1 size-10" />}
      >
        <span className="">Фильтры</span>
        {countFilters > 0 ? (
          <Badge className="absolute -top-2 -right-2 px-1.5">{countFilters}</Badge>
        ) : null}
      </Button>
      {/* {countFilters > 0 && (
        <Button
          onClick={() => resetAllFilters()}
          size="sm"
          variant="destructive"
          circle
          className="size-9 opacity-60 hover:opacity-100"
        >
          <TrashIcon className="size-5" />
        </Button>
      )} */}
    </div>
  );
};
