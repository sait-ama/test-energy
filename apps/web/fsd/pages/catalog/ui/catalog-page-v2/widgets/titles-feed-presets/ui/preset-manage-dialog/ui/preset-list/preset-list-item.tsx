'use client';

import { memo } from 'react';

import EditIcon from '@re/ui-kit/icons/edit';
import MoreHorizontalIcon from '@re/ui-kit/icons/more-horizontal';
import TrashIcon from '@re/ui-kit/icons/trash';
import { Badge } from '@re/ui-kit/ui/badge';
import { Button } from '@re/ui-kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@re/ui-kit/ui/dropdown-menu';

import type { Preset } from '../../../../model/types';

interface PresetListItemProps {
  preset: Preset;
  isSelected?: boolean;
  onView: (preset: Preset) => void;
  onEdit: (preset: Preset) => void;
  onDuplicate: (preset: Preset) => void;
  onDelete: (preset: Preset) => void;
}

export const PresetListItem = memo<PresetListItemProps>(
  ({ preset, isSelected = false, onView, onEdit, onDuplicate, onDelete }) => {
    const filtersCount = Object.keys(preset.filters).length;

    return (
      <div
        className={`group bg-card flex max-w-full cursor-pointer items-center justify-between overflow-hidden rounded-full py-1.5 pr-1.5 pl-4 transition-colors ${
          isSelected ? 'bg-accent/30' : ''
        } `}
      >
        <div
          role="button"
          className="min-w-0 flex-1 overflow-hidden"
          onClick={() => onView(preset)}
        >
          <div className="grid w-full grid-cols-[1fr_auto] items-center gap-2">
            <h3 className="min-w-0 truncate text-sm font-semibold">{preset.name}</h3>
            <Badge variant="outline" className="text-xs whitespace-nowrap">
              {filtersCount}{' '}
              {filtersCount === 1 ? 'фильтр' : filtersCount < 5 ? 'фильтра' : 'фильтров'}
            </Badge>
          </div>

          {/* <div className="flex flex-wrap gap-1">
            {Object.keys(preset.filters)
              .slice(0, 3)
              .map((filterKey) => (
                <Badge key={filterKey} variant="outline" className="text-xs">
                  {filterKey}
                </Badge>
              ))}
            {Object.keys(preset.filters).length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{Object.keys(preset.filters).length - 3}
              </Badge>
            )}
          </div> */}
        </div>

        <div className="ml-4 flex items-center gap-1">
          {/* <Button
            size="sm"
            variant="flat"
            circle
            onClick={(e) => {
              e.stopPropagation();
              onView(preset);
            }}
            className="opacity-0 transition-opacity group-hover:opacity-100"
          >
            <EyeIcon className="h-4 w-4" />
          </Button> */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="flat"
                circle
                onClick={(e) => e.stopPropagation()}
                className="opacity-0 transition-opacity group-hover:opacity-100"
              >
                <MoreHorizontalIcon className="fill-foreground h-4 w-4 rotate-90" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* <DropdownMenuItem onClick={() => onView(preset)}>
                <EyeIcon className="mr-2 h-4 w-4" />
                Просмотр
              </DropdownMenuItem> */}
              <DropdownMenuItem onClick={() => onEdit(preset)}>
                <EditIcon className="mr-2 h-4 w-4" />
                Редактировать
              </DropdownMenuItem>
              {/* <DropdownMenuItem onClick={() => onDuplicate(preset)}>
                <CopyIcon className="mr-2 h-4 w-4" />
                Дублировать
              </DropdownMenuItem> */}
              <DropdownMenuItem
                onClick={() => onDelete(preset)}
                className="text-destructive focus:text-destructive"
              >
                <TrashIcon className="mr-2 h-4 w-4" />
                Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }
);

PresetListItem.displayName = 'PresetListItem';
